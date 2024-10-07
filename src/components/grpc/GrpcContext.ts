import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { transform, TransformResult } from "../transform/Transform.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";
import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { usePrevious } from "react-use";
import { GrpcTransportParts } from "./GrpcProviderWithDialog.tsx";

export interface GrpcContextProps {
  transport: GrpcWebFetchTransport;
}

export const GrpcContext = createContext<GrpcContextProps | null>(null);

export function getTransport(parts: GrpcTransportParts) {
  return new GrpcWebFetchTransport({
    baseUrl: `${location.protocol}//${parts.domain}:${parts.port}`,
  });
}

export function useGrpcClient<T extends ServiceInfo>(
  clientConstructor: new (transport: GrpcWebFetchTransport) => T,
) {
  const context = useContext(GrpcContext);

  return useMemo(() => {
    if (context) {
      return new clientConstructor(context.transport);
    }
  }, [context, clientConstructor]);
}

export function useTransformClient(
  imageData: Uint8Array | null,
  transformations: Transform[],
) {
  const client = useGrpcClient(TransformServiceClient);
  const previousImageData = usePrevious(imageData);
  const [transformResults, setTransformResults] = useState<TransformResult[]>(
    [],
  );

  useEffect(() => {
    // can't get aborts to work properly
    // const abortController = new AbortController();

    if (imageData && client && previousImageData !== imageData) {
      transform(imageData, client, transformations).then(setTransformResults);
    }

    return () => {
      // abortController.abort();
    };
  }, [imageData, client, transformations, previousImageData]);

  return transformResults;
}
