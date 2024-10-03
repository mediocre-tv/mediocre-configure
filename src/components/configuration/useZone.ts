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
  const zone = zones.find((zone) => zone.id === id);
  if (!zone) {
    return null;
  }

  function setZone(zoneToSet: Zone) {
    const index = zones.findIndex((zone) => zone.id === id);
    if (index !== -1) {
      setZones(zones.splice(index, 1, zoneToSet));
    } else {
      setZones([...zones, zoneToSet]);
    }
  }

  return {
    zone,
    setZone,
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
