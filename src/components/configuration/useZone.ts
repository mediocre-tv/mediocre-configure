import { Zone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useStage, useStages } from "./useStage";

export function useZone(id: string | undefined) {
  const { stages } = useStages();
  const foundStage = stages.find((stage) =>
    stage.zones.some((zone) => zone.id === id),
  );

  if (!foundStage) {
    throw new Error(`No stage found for zone id ${id}`);
  }

  const { zones, setZones, stage, configuration } = useZones(foundStage.id);

  const index = zones.findIndex((zone) => zone.id === id);
  if (index === -1) {
    throw new Error(`No zone found for id ${id}`);
  }

  return {
    zone: zones[index],
    setZone: (zone: Zone) => {
      const splicedZones = zones;
      splicedZones.splice(index, 1, zone);
      setZones(splicedZones);
    },
    deleteZone: () => {
      setZones(zones.filter((zone) => zone.id !== id));
    },
    stage,
    configuration,
  };
}

export function useZones(stageId: string | undefined) {
  const { stage, setStage, configuration } = useStage(stageId);
  return {
    zones: stage.zones,
    setZones: (zones: Zone[]) =>
      setStage(stage.id === stageId ? { ...stage, zones: zones } : stage),
    stage,
    configuration,
  };
}
