import { ZoneResultsKey } from "./ZoneResultsContext.ts";
import { useZoneResultsMap } from "./useZoneResultsMap.ts";

export function useZoneResultsForKey(key: ZoneResultsKey) {
  const zoneResults = useZoneResultsMap();

  return {
    results: zoneResults.get(key) ?? [],
  };
}
