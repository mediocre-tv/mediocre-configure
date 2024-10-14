import { createContext } from "react";

export interface RegionContextProps {
  id: string;
}

export const RegionContext = createContext<RegionContextProps | null>(null);
