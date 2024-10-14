import { ZoneResultsKey } from "../zone-results/ZoneResultsContext.ts";
import { useZoneResultMap } from "./useZoneResultMap.ts";

export function useZoneResultForKey(key: ZoneResultsKey) {
  const results = useZoneResultMap();

  return {
    result: results.get(key) ?? null,
  };
}
