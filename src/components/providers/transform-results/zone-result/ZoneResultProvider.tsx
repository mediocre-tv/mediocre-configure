import { PropsWithChildren, useContext, useMemo } from "react";
import { ZoneResultsContext } from "../zone-results/ZoneResultsContext.ts";
import {
  ZoneResultContext,
  ZoneResultEntry,
  ZoneResultMap,
} from "./ZoneResultContext.ts";

export function ZoneResultProvider({ children }: PropsWithChildren) {
  const zoneResultsContext = useContext(ZoneResultsContext);

  if (!zoneResultsContext) {
    throw new Error("useZoneResult must be used within a ZoneResultsProvider");
  }

  const { zoneResults: zoneAllResults } = zoneResultsContext;

  const results = useMemo(
    () =>
      new ZoneResultMap(
        zoneAllResults
          .entries()
          .map(({ key, value }) => {
            return { key, value: value?.at(key.transforms.length - 1) };
          })
          .filter(
            (entry): entry is ZoneResultEntry => entry.value !== undefined,
          ),
      ),
    [zoneAllResults],
  );

  return (
    <ZoneResultContext.Provider value={{ results: results }}>
      {children}
    </ZoneResultContext.Provider>
  );
}
