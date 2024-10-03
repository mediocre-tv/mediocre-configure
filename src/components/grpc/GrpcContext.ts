import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { transform, TransformResult } from "../transform/Transform.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";
import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";

export interface GrpcContextProps {
  domain: string;
  port: string;
}

export const GrpcContext = createContext<GrpcContextProps | null>(null);

export function getTransport(context: GrpcContextProps) {
  return new GrpcWebFetchTransport({
    baseUrl: `${location.protocol}//${context.domain}:${context.port}`,
  });
}

export function useGrpcClient<T extends ServiceInfo>(
  clientConstructor: new (transport: GrpcWebFetchTransport) => T,
) {
  const context = useContext(GrpcContext);

  return useMemo(() => {
    if (context) {
      const transport = getTransport(context);
      return new clientConstructor(transport);
    }
  }, [context, clientConstructor]);
}

export function useTransformClient(
  imageData: Uint8Array | null,
  transformations: Transform[],
) {
  const client = useGrpcClient(TransformServiceClient);
  const [transformResults, setTransformResults] = useState<TransformResult[]>(
    [],
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (imageData && client) {
      transform(imageData, client, transformations, abortController).then(
        setTransformResults,
      );
    }

    return () => {
      abortController.abort();
    };
  }, [imageData, client, transformations]);

  return transformResults;
}
