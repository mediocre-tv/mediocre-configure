import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { useContext } from "react";
import { GrpcContext } from "./GrpcContext.tsx";

export default function useGrpc() {
  const context = useContext(GrpcContext);
  return context
    ? new GrpcWebFetchTransport({ baseUrl: context.baseUrl })
    : null;
}
