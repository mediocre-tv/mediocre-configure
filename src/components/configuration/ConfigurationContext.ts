import {
  Configuration,
  Region,
  Stage,
  Zone,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { createContext, useContext } from "react";

export interface ConfigurationContextProps {
  configuration: Configuration;
  setConfiguration: (configuration: Configuration) => void;
}

export const ConfigurationContext =
  createContext<ConfigurationContextProps | null>(null);

export function useConfiguration() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    return null;
  }

  const { configuration, setConfiguration } = configurationContext;
  return {
    configuration,
    setConfiguration,
  };
}

export function useStages() {
  const configurationContext = useConfiguration();
  if (!configurationContext) {
    return null;
  }

  const { configuration, setConfiguration } = configurationContext;

  return {
    stages: configuration.stages,
    setStages: (stages: Stage[]) =>
      setConfiguration({
        ...configuration,
        stages: stages,
      }),
  };
}

export function useStage(id: string | undefined) {
  const stageContext = useConfiguration();
  if (!stageContext || !id) {
    return null;
  }

  function findStage(id: string) {
    return configuration.stages.find((s) => s.id === id);
  }

  const { configuration, setConfiguration } = stageContext;
  const stage = findStage(id);
  if (!stage) {
    return null;
  }

  function setStage(newStage: Stage) {
    if (!findStage(newStage.id)) {
      setConfiguration({
        ...configuration,
        stages: [...configuration.stages, newStage],
      });
    } else {
      setConfiguration({
        ...configuration,
        stages: configuration.stages.map((stage) =>
          stage.id === id ? newStage : stage,
        ),
      });
    }
  }

  return {
    stage,
    setStage,
  };
}

export function useZones(stageId: string | undefined) {
  const stagesContext = useStages();
  if (!stagesContext || !stageId) {
    return null;
  }

  const { stages, setStages } = stagesContext;
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
  };
}

export function useZone(id: string | undefined) {
  const configurationContext = useConfiguration();
  const foundStage = configurationContext?.configuration.stages.find((stage) =>
    stage.zones.some((z) => z.id === id),
  );
  const stageContext = useStage(foundStage?.id);
  if (!configurationContext || !stageContext || !id) {
    return null;
  }

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
  };
}

export function useRegions(zoneId: string | undefined) {
  const stagesContext = useStages();
  const foundStage = stagesContext?.stages.find((stage) =>
    stage.zones.some((z) => z.id === zoneId),
  );
  const zonesContext = useZones(foundStage?.id);
  if (!zonesContext) {
    return null;
  }

  const { zones, setZones } = zonesContext;
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) {
    return null;
  }

  return {
    regions: zone.regions,
    setRegions: (regions: Region[]) =>
      setZones(
        zones.map((zone) =>
          zone.id === zoneId ? { ...zone, regions: regions } : zone,
        ),
      ),
  };
}

export function useRegion(id: string | undefined) {
  const configurationContext = useConfiguration();
  const foundStage = configurationContext?.configuration.stages.find((stage) =>
    stage.zones.some((z) => z.regions.some((r) => r.id === id)),
  );
  const foundZone = foundStage?.zones.find((z) =>
    z.regions.some((r) => r.id === id),
  );
  const zoneContext = useZone(foundZone?.id);
  if (!configurationContext || !zoneContext || !id) {
    return null;
  }

  const { zone, setZone } = zoneContext;
  if (!zone) {
    return null;
  }

  function findRegion(id: string) {
    return zone.regions.find((r) => r.id === id);
  }

  const region = findRegion(id);
  if (!region) {
    return null;
  }

  function setRegion(newRegion: Region) {
    if (!findRegion(newRegion.id)) {
      setZone({
        ...zone,
        regions: [...zone.regions, newRegion],
      });
    } else {
      setZone({
        ...zone,
        regions: zone.regions.map((region) =>
          region.id === id ? newRegion : region,
        ),
      });
    }
  }

  return {
    region,
    setRegion,
  };
}
