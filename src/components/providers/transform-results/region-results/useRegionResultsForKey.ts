import { useContext } from "react";
import {
  RegionResultsContext,
  RegionResultsKey,
} from "./RegionResultsContext.ts";

export function useRegionResultsForKey(key: RegionResultsKey) {
  const regionResultsContext = useContext(RegionResultsContext);

  if (!regionResultsContext) {
    throw new Error(
      "useRegionResultsForKey must be used within a RegionResultsProvider",
    );
  }

  const { regionResults } = regionResultsContext;

  return {
    results: regionResults.get(key) ?? [],
  };
}
