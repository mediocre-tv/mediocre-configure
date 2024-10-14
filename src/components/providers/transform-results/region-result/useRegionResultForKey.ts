import { RegionResultsKey } from "../region-results/RegionResultsContext.ts";
import { useRegionResultMap } from "./useRegionResultMap.ts";

export function useRegionResultForKey(key: RegionResultsKey) {
  const results = useRegionResultMap();

  return {
    result: results.get(key) ?? null,
  };
}
