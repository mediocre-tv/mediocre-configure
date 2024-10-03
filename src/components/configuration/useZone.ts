import { Zone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useStage, useStages } from "./useStage";

export function useZone(id: string | undefined) {
  const stagesContext = useStages();
  const foundStage = stagesContext?.stages.find((stage) =>
    stage.zones.some((zone) => zone.id === id),
  );
  const zonesContext = useZones(foundStage?.id);
  if (!zonesContext) {
    return null;
  }

  const { zones, setZones, stage, configuration } = zonesContext;
  const index = zones.findIndex((zone) => zone.id === id);
  if (index !== -1) {
    return null;
  }

  return {
    zone: zones[index],
    setZone: (zone: Zone) => setZones(zones.splice(index, 1, zone)),
    stage,
    configuration,
  };
}

export function useZones(stageId: string | undefined) {
  const stageContext = useStage(stageId);
  if (!stageContext) {
    return null;
  }

  const { stage, setStage, configuration } = stageContext;
  return {
    zones: stage.zones,
    setZones: (zones: Zone[]) =>
      setStage(stage.id === stageId ? { ...stage, zones: zones } : stage),
    stage,
    configuration,
  };
}
