import { createContext, useContext, useMemo } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";

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
