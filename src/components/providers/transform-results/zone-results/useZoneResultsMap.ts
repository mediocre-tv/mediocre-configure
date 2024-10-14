import { useContext } from "react";
import { ZoneResultsContext } from "./ZoneResultsContext.ts";

export function useZoneResultsMap() {
  const resultsContext = useContext(ZoneResultsContext);
  if (!resultsContext) {
    throw new Error(
      "useZoneResultsMap must be used within a ZoneResultsProvider",
    );
  }

  return resultsContext.zoneResults;
}
