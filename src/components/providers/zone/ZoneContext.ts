import { createContext } from "react";

export interface ZoneContextProps {
  id: string;
}

export const ZoneContext = createContext<ZoneContextProps | null>(null);
