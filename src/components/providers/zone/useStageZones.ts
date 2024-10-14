import {
  ZoneConfiguration,
  ZoneConfigurations,
} from "../configuration/ConfigurationContext.ts";
import { useStage } from "../stage/useStage.ts";
import { useZones } from "./useZones.ts";

export function useStageZones() {
  const { stage } = useStage();
  const { zones, setZones } = useZones();

  const stageZones: ZoneConfigurations = new Map(
    Array.from(zones).filter(([, zone]) =>
      zone.stagePaths.some((stagePath) => stagePath.stageId === stage.id),
    ),
  );

  const nonStageZones: ZoneConfigurations = new Map(
    Array.from(zones).filter(([id]) => !stageZones.has(id)),
  );

  const setStageZones = (newStageZones: ZoneConfigurations) => {
    const updatedZones = new Map(
      Array.from(zones)
        .map(([id]) => [id, newStageZones.get(id) || nonStageZones.get(id)])
        .filter(
          (zone): zone is [id: string, zone: ZoneConfiguration] =>
            zone[1] !== undefined,
        ),
    );
    const newZones = Array.from(newStageZones).filter(
      ([id]) => !updatedZones.has(id),
    );

    setZones(new Map([...updatedZones, ...newZones]));
  };

  return {
    stage: stage,
    zones: stageZones,
    setZones: setStageZones,
  };
}
