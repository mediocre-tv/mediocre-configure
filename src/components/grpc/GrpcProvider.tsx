import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { createContext, PropsWithChildren, useContext } from "react";

export interface GrpcContextProps {
  baseUrl: string;
}

const GrpcContext = createContext<GrpcContextProps | null>(null);

export interface GrpcProviderProps {
  context: GrpcContextProps | null;
}

function GrpcProvider({
  children,
  context,
}: PropsWithChildren<GrpcProviderProps>) {
  return (
    <GrpcContext.Provider value={context}>{children}</GrpcContext.Provider>
  );
}

function useGrpc() {
  const context = useContext(GrpcContext);
  return context
    ? new GrpcWebFetchTransport({ baseUrl: context.baseUrl })
    : null;
}

export { GrpcProvider, useGrpc };
