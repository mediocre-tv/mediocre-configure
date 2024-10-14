import { useContext } from "react";
import { RegionResultContext } from "./RegionResultContext.ts";

export function useRegionResultMap() {
  const regionResultContext = useContext(RegionResultContext);

  if (!regionResultContext) {
    throw new Error(
      "useRegionResultForKey must be used within a RegionResultProvider",
    );
  }

  return regionResultContext.results;
}
