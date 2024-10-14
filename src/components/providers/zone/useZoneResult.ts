import { useStage } from "../stage/useStage.ts";
import { useZone } from "./useZone.ts";
import { getZoneResultsKey } from "./useZoneResults.ts";
import { useZoneResultForKey } from "../transform-results/zone-result/useZoneResultForKey.ts";

export function useZoneResult(timestamp: number) {
  const { stage } = useStage();
  const { zone } = useZone();

  const key = getZoneResultsKey(stage, zone, timestamp);

  return useZoneResultForKey(key);
}
