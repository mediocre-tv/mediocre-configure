import { useStage } from "../stage/useStage.ts";
import { useZone } from "./useZone.ts";
import { useTransformResults } from "../transform-results/useTransformResults.ts";
import { TransformResultsKey } from "../transform-results/TransformResultsContext.ts";

export function useZoneResults(timestamp: number) {
  const { stage } = useStage();
  const { zone } = useZone();

  const key: TransformResultsKey = {
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

  return useTransformResults(key);
}
