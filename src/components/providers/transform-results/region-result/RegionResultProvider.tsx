import { PropsWithChildren, useContext, useMemo } from "react";
import { RegionResultsContext } from "../region-results/RegionResultsContext.ts";
import {
  RegionResultContext,
  RegionResultEntry,
  RegionResultMap,
} from "./RegionResultContext.ts";

export function RegionResultProvider({ children }: PropsWithChildren) {
  const regionResultsContext = useContext(RegionResultsContext);

  if (!regionResultsContext) {
    throw new Error(
      "useRegionResult must be used within a RegionResultsProvider",
    );
  }

  const { regionResults: regionAllResults } = regionResultsContext;

  const results = useMemo(
    () =>
      new RegionResultMap(
        regionAllResults
          .entries()
          .map(({ key, value }) => {
            return { key, value: value?.at(key.transforms.length - 1) };
          })
          .filter(
            (entry): entry is RegionResultEntry => entry.value !== undefined,
          ),
      ),
    [regionAllResults],
  );

  return (
    <RegionResultContext.Provider value={{ results: results }}>
      {children}
    </RegionResultContext.Provider>
  );
}
