import { Zone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useStage, useStages } from "./useStage";
import { useConfiguration } from "./useConfiguration";

export function useZone(id: string | undefined) {
  const configurationContext = useConfiguration();
  const foundStage = configurationContext?.configuration.stages.find((stage) =>
    stage.zones.some((z) => z.id === id),
  );
  const stageContext = useStage(foundStage?.id);
  if (!configurationContext || !stageContext || !id) {
    return null;
  }

  const { configuration } = configurationContext;
  const { stage, setStage } = stageContext;
  if (!stage) {
    return null;
  }

  function findZone(id: string) {
    return stage.zones.find((z) => z.id === id);
  }

  const zone = findZone(id);
  if (!zone) {
    return null;
  }

  function setZone(newZone: Zone) {
    if (!findZone(newZone.id)) {
      setStage({
        ...stage,
        zones: [...stage.zones, newZone],
      });
    } else {
      setStage({
        ...stage,
        zones: stage.zones.map((zone) => (zone.id === id ? newZone : zone)),
      });
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
  const stagesContext = useStages();
  if (!stagesContext || !stageId) {
    return null;
  }

  const { stages, setStages, configuration } = stagesContext;
  const stage = stages.find((s) => s.id === stageId);
  if (!stage) {
    return null;
  }

  return {
    zones: stage.zones,
    setZones: (zones: Zone[]) =>
      setStages(
        stages.map((stage) =>
          stage.id === stageId ? { ...stage, zones: zones } : stage,
        ),
      ),
    stage,
    configuration,
  };
}
