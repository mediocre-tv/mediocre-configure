import { createContext } from "react";

export interface GrpcContextProps {
  baseUrl: string;
}

export const GrpcContext = createContext<GrpcContextProps | null>(null);
