import { useStage } from "../stage/useStage.ts";
import { useZone } from "./useZone.ts";
import { useZoneResultsForKey } from "../transform-results/zone-results/useZoneResultsForKey.ts";
import { ZoneResultsKey } from "../transform-results/zone-results/ZoneResultsContext.ts";
import {
  StageConfiguration,
  ZoneConfiguration,
} from "../configuration/ConfigurationContext.ts";

export function useZoneResults(timestamp: number) {
  const { stage } = useStage();
  const { zone } = useZone();

  const key = getZoneResultsKey(stage, zone, timestamp);

  return useZoneResultsForKey(key);
}

export function getZoneResultsKey(
  stage: StageConfiguration,
  zone: ZoneConfiguration,
  timestamp: number,
): ZoneResultsKey {
  return {
    stageId: stage.id,
    zoneId: zone.id,
    timestamp: timestamp,
    transforms: zone.transforms.map((transformation) => ({
      transformation: {
        oneofKind: "imageToImage",
        imageToImage: transformation,
      },
    })),
  };
}
