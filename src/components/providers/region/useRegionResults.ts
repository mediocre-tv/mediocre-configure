import { useStage } from "../stage/useStage.ts";
import { useRegion } from "./useRegion.ts";
import { useZone } from "../zone/useZone.ts";
import { RegionResultsKey } from "../transform-results/region-results/RegionResultsContext.ts";
import { getZoneResultsKey } from "../zone/useZoneResults.ts";
import {
  RegionConfiguration,
  StageConfiguration,
  ZoneConfiguration,
} from "../configuration/ConfigurationContext.ts";
import { useRegionResultsForKey } from "../transform-results/region-results/useRegionResultsForKey.ts";

export function useRegionResults(timestamp: number) {
  const { stage } = useStage();
  const { zone } = useZone();
  const { region } = useRegion();

  const key = getRegionResultsKey(stage, zone, region, timestamp);

  return useRegionResultsForKey(key);
}

export function getRegionResultsKey(
  stage: StageConfiguration,
  zone: ZoneConfiguration,
  region: RegionConfiguration,
  timestamp: number,
): RegionResultsKey {
  return {
    zoneKey: getZoneResultsKey(stage, zone, timestamp),
    regionId: region.id,
    transforms: region.transforms,
  };
}
