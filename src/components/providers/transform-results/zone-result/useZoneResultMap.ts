import { useContext } from "react";
import { ZoneResultContext } from "./ZoneResultContext.ts";

export function useZoneResultMap() {
  const zoneResultContext = useContext(ZoneResultContext);

  if (!zoneResultContext) {
    throw new Error(
      "useZoneResultForKey must be used within a ZoneResultProvider",
    );
  }

  return zoneResultContext.results;
}
