import { createContext } from "react";

export interface StageContextProps {
  id: string;
}

export const StageContext = createContext<StageContextProps | null>(null);
