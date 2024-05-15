import { PropsWithChildren } from "react";
import { GrpcContext, GrpcContextProps } from "./GrpcContext.ts";

interface GrpcProviderProps {
  context: GrpcContextProps | null;
}

export default function GrpcProvider({
  children,
  context,
}: PropsWithChildren<GrpcProviderProps>) {
  return (
    <GrpcContext.Provider value={context}>{children}</GrpcContext.Provider>
  );
}
