import { PropsWithChildren } from "react";
import { StageContext } from "./StageContext.ts";

export interface StageProviderProps {
  id: string;
}

export function StageProvider({
  children,
  id,
}: PropsWithChildren<StageProviderProps>) {
  return (
    <StageContext.Provider
      value={{
        id,
      }}
    >
      {children}
    </StageContext.Provider>
  );
}
