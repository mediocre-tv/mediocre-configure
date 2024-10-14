import { useStage } from "../stage/useStage.ts";
import { getRegionResultsKey } from "./useRegionResults.ts";
import { useRegionResultForKey } from "../transform-results/region-result/useRegionResultForKey.ts";
import { useRegion } from "./useRegion.ts";
import { useZone } from "../zone/useZone.ts";

export function useRegionResult(timestamp: number) {
  const { stage } = useStage();
  const { zone } = useZone();
  const { region } = useRegion();

  const key = getRegionResultsKey(stage, zone, region, timestamp);

  return useRegionResultForKey(key);
}
