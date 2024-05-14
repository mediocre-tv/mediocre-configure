import { createContext, useContext } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

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

export function useGrpc() {
  const context = useContext(GrpcContext);
  return context ? getTransport(context) : null;
}
