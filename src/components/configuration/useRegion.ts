import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useZone, useZones } from "./useZone.ts";
import { useStages } from "./useStage.ts";
import { useConfiguration } from "./useConfiguration.ts";

export function useRegions(zoneId: string | undefined) {
  const stagesContext = useStages();
  const foundStage = stagesContext?.stages.find((stage) =>
    stage.zones.some((z) => z.id === zoneId),
  );
  const zonesContext = useZones(foundStage?.id);
  if (!zonesContext) {
    return null;
  }

  const { zones, setZones, stage, configuration } = zonesContext;
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
    stage,
    configuration,
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

  const { zone, setZone, stage, configuration } = zoneContext;
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
    zone,
    stage,
    configuration,
  };
}
