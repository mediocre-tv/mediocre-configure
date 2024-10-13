import { PropsWithChildren } from "react";
import { ZoneContext } from "./ZoneContext.ts";

export interface ZoneProviderProps {
  id: string;
}

export function ZoneProvider({
  children,
  id,
}: PropsWithChildren<ZoneProviderProps>) {
  return (
    <ZoneContext.Provider
      value={{
        id,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
}
