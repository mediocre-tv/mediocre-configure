import { PropsWithChildren } from "react";
import { RegionContext } from "./RegionContext.ts";

export interface RegionProviderProps {
  id: string;
}

export function RegionProvider({
  children,
  id,
}: PropsWithChildren<RegionProviderProps>) {
  return (
    <RegionContext.Provider
      value={{
        id,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}
