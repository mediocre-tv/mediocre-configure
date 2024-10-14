import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useGrpcClient } from "../../grpc/GrpcContext.ts";
import { useFrames } from "../../frame/useFrames.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";
import { isRpcError } from "../../grpc/GrpcHealth.ts";
import { useConfiguration } from "../../configuration/useConfiguration.ts";
import {
  BatchTransforms,
  BatchTransformsRequest,
  Transform,
  TransformResponse,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Frames } from "../../frame/FrameContext.ts";
import {
  ZoneResultOrError,
  ZoneResultsContext,
  ZoneResultsKey,
  ZoneResultsMap,
} from "./ZoneResultsContext.ts";

export function ZoneResultsProvider({ children }: PropsWithChildren) {
  const { frames } = useFrames();
  const [zoneResults, setZoneResults] = useState<ZoneResultsMap>(
    new ZoneResultsMap(),
  );
  const pendingZoneKeys = usePendingZoneKeys(zoneResults);
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
      key: ZoneResultsKey,
      transformResponse: TransformResponse[],
    ) => {
      const results = transformResponse.map(getResultFromResponse);
      setZoneResults((resultsMap) => {
        return new ZoneResultsMap(resultsMap.set(key, results).entries());
      });
    };

    getZoneResultsMap(
      pendingZoneKeys,
      frames,
      onTransformResponses,
      client,
    ).then(() => {
      setIsTransforming(false);
    });

    return () => {
      // abortController.abort();
    };
  }, [pendingZoneKeys, client, frames, zoneResults, isTransforming]);

  return (
    <ZoneResultsContext.Provider value={{ zoneResults }}>
      {children}
    </ZoneResultsContext.Provider>
  );
}

function usePendingZoneKeys(results: ZoneResultsMap) {
  const { zones, regions } = useConfiguration();

  const allZoneResultsKeys = useMemo(() => {
    const zoneTimestamps = Array.from(zones.values()).flatMap((zone) =>
      zone.tests.map((test) => test.time),
    );
    const regionTimestamps = Array.from(regions.values()).flatMap((region) =>
      region.tests.map((test) => test.time),
    );
    const timestamps = [...new Set([...zoneTimestamps, ...regionTimestamps])];

    return Array.from(zones.values()).flatMap((zone) =>
      zone.stagePaths.flatMap((stagePath) =>
        timestamps.map(
          (timestamp): ZoneResultsKey => ({
            ...stagePath,
            zoneId: zone.id,
            timestamp: timestamp,
            transforms: zone.transforms.map((transformation) => ({
              transformation: {
                oneofKind: "imageToImage",
                imageToImage: transformation,
              },
            })),
          }),
        ),
      ),
    );
  }, [regions, zones]);

  return useMemo(
    () => allZoneResultsKeys.filter((key) => !results.has(key)),
    [
      allZoneResultsKeys,
      results, // results causes this to re-render when it shouldn't
    ],
  );
}

function getResultFromResponse(
  timedResponse: TransformResponse,
): ZoneResultOrError {
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
    }
  }

  return { error: "Unknown response", elapsed: timedResponse.elapsed };
}

async function getZoneResultsMap(
  keys: ZoneResultsKey[],
  frames: Frames,
  onTransformResponses: (
    key: ZoneResultsKey,
    responses: TransformResponse[],
  ) => void,
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const keysByTimestamp = Map.groupBy(keys, (transform) => transform.timestamp);

  for (const [time, transformKeys] of keysByTimestamp) {
    const frame = frames.get(time);
    if (!frame) {
      // not yet grabbed, should exist on a later render
      continue;
    }

    const batch: BatchTransforms[] = transformKeys.flatMap((transformKey) => ({
      id: [transformKey.stageId, transformKey.zoneId].join(":"),
      transforms: transformKey.transforms,
    }));

    await transformBatch(
      frame,
      time,
      batch,
      onTransformResponses,
      client,
      abortController,
    );
  }
}

async function transformBatch(
  frame: string,
  time: number,
  batch: BatchTransforms[],
  onTransformResponses: (
    key: ZoneResultsKey,
    responses: TransformResponse[],
  ) => void,
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const imageData = await fetch(frame)
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

  const getKey = (id: string, transforms: Transform[]): ZoneResultsKey => {
    const idParts = id.split(":");
    return {
      stageId: idParts[0],
      zoneId: idParts[1],
      timestamp: time,
      transforms: transforms,
    };
  };

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
