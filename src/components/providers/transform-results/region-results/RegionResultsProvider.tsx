import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  RegionResultOrError,
  RegionResultsContext,
  RegionResultsKey,
  RegionResultsMap,
} from "./RegionResultsContext.ts";
import { useGrpcClient } from "../../grpc/GrpcContext.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";
import { isRpcError } from "../../grpc/GrpcHealth.ts";
import { useConfiguration } from "../../configuration/useConfiguration.ts";
import {
  BatchTransforms,
  BatchTransformsRequest,
  Transform,
  TransformResponse,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { ZoneResultsKey } from "../zone-results/ZoneResultsContext.ts";
import { ZoneResultMap } from "../zone-result/ZoneResultContext.ts";
import { useZoneResultMap } from "../zone-result/useZoneResultMap.ts";

export function RegionResultsProvider({ children }: PropsWithChildren) {
  const zoneResultMap = useZoneResultMap();
  const [regionResults, setRegionResults] = useState<RegionResultsMap>(
    new RegionResultsMap(),
  );
  const pendingRegionKeys = usePendingRegionKeys(
    zoneResultMap.keys(),
    regionResults,
  );
  const [isTransforming, setIsTransforming] = useState(false); // can we abort instead?

  const client = useGrpcClient(TransformServiceClient);

  useEffect(() => {
    // can't get aborts to work properly
    // const abortController = new AbortController();

    if (!client || isTransforming) {
      return;
    }

    setIsTransforming(true);

    const onTransformResponses = (
      key: RegionResultsKey,
      transformResponse: TransformResponse[],
    ) => {
      const results = transformResponse.map(getResultFromResponse);
      setRegionResults((resultsMap) => {
        return new RegionResultsMap(resultsMap.set(key, results).entries());
      });
    };

    getRegionResultsMap(
      pendingRegionKeys,
      zoneResultMap,
      onTransformResponses,
      client,
    ).then(() => {
      setIsTransforming(false);
    });

    return () => {
      // abortController.abort();
    };
  }, [pendingRegionKeys, client, zoneResultMap, regionResults, isTransforming]);

  return (
    <RegionResultsContext.Provider value={{ regionResults: regionResults }}>
      {children}
    </RegionResultsContext.Provider>
  );
}

function usePendingRegionKeys(
  zoneResultKeys: ZoneResultsKey[],
  regionResults: RegionResultsMap,
) {
  const { regions } = useConfiguration();

  const allRegionResultsKeys = useMemo(
    () =>
      Array.from(regions.values()).flatMap((region) =>
        region.zonePaths.flatMap(({ stageId, zoneId }) => {
          const zoneKeys = zoneResultKeys.filter(
            (key) => key.stageId === stageId && key.zoneId === zoneId,
          );

          return zoneKeys.map(
            (zoneKey): RegionResultsKey => ({
              zoneKey,
              regionId: region.id,
              transforms: region.transforms,
            }),
          );
        }),
      ),
    [regions, zoneResultKeys],
  );

  return useMemo(() => {
    return allRegionResultsKeys.filter((key) => !regionResults.has(key));
  }, [
    allRegionResultsKeys,
    regionResults, // results causes this to re-render when it shouldn't
  ]);
}

function getResultFromResponse(
  timedResponse: TransformResponse,
): RegionResultOrError {
  const response = timedResponse.response;
  if (response.oneofKind === "error") {
    return { error: response.error, elapsed: timedResponse.elapsed };
  }

  if (response.oneofKind === "transformed") {
    const transformed = response.transformed;
    switch (transformed.value.oneofKind) {
      case "image": {
        const data = transformed.value.image.blob?.data;
        if (data) {
          return {
            image: URL.createObjectURL(new Blob([data])),
            elapsed: timedResponse.elapsed,
          };
        } else {
          return { error: "No data in image", elapsed: timedResponse.elapsed };
        }
      }
      case "characters": {
        return {
          text: transformed.value.characters,
          elapsed: timedResponse.elapsed,
        };
      }
    }
  }

  return { error: "Unknown response", elapsed: timedResponse.elapsed };
}

async function getRegionResultsMap(
  keys: RegionResultsKey[],
  zoneResultMap: ZoneResultMap,
  onTransformResponses: (
    key: RegionResultsKey,
    responses: TransformResponse[],
  ) => void,
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const regionsByZoneKey = Map.groupBy(keys, (key) => key.zoneKey);

  for (const [zoneKey, regionKeys] of regionsByZoneKey) {
    const zoneResult = zoneResultMap.get(zoneKey);
    if (!zoneResult || "error" in zoneResult) {
      // not yet grabbed, should exist on a later render
      // or if errored, we can't transform the region anyway
      continue;
    }

    const batch: BatchTransforms[] = regionKeys.flatMap((regionKey) => ({
      id: regionKey.regionId,
      transforms: regionKey.transforms,
    }));

    await transformBatch(
      zoneResult.image,
      zoneKey,
      batch,
      onTransformResponses,
      client,
      abortController,
    );
  }
}

async function transformBatch(
  image: string,
  zoneKey: ZoneResultsKey,
  batch: BatchTransforms[],
  onTransformResponses: (
    key: RegionResultsKey,
    responses: TransformResponse[],
  ) => void,
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const imageData = await fetch(image)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  const request: BatchTransformsRequest = {
    image: {
      blob: {
        data: imageData,
      },
    },
    batch: batch,
  };

  const transform = client.transformBatch(request, {
    abort: abortController?.signal,
  });

  const getKey = (id: string, transforms: Transform[]): RegionResultsKey => ({
    zoneKey: zoneKey,
    regionId: id,
    transforms: transforms,
  });

  try {
    for await (const { id, transforms, responses } of transform.responses) {
      const key = getKey(id, transforms);
      onTransformResponses(key, responses);
    }
  } catch (error) {
    let errorMessage;
    if (isRpcError(error)) {
      errorMessage = error.message || error.code;
    } else {
      errorMessage = "Unknown error";
    }
    throw new Error(errorMessage);
  }
}
