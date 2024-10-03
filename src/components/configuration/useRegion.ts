import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useZone } from "./useZone.ts";
import { useStages } from "./useStage.ts";

export function useRegion(id: string | undefined) {
  const stagesContext = useStages();
  const foundStage = stagesContext?.stages.find((stage) =>
    stage.zones.some((zone) => zone.regions.some((region) => region.id === id)),
  );
  const foundZone = foundStage?.zones.find((zone) =>
    zone.regions.some((region) => region.id === id),
  );
  const regionsContext = useRegions(foundZone?.id);
  if (!regionsContext) {
    return null;
  }

  const { regions, setRegions, zone, stage, configuration } = regionsContext;
  const index = regions.findIndex((region) => region.id === id);
  if (!index) {
    return null;
  }

  return {
    region: regions[index],
    setRegion: (region: Region) => setRegions(regions.splice(index, 1, region)),
    zone,
    stage,
    configuration,
  };
}

export function useRegions(zoneId: string | undefined) {
  const zoneContext = useZone(zoneId);
  if (!zoneContext) {
    return null;
  }

  const { zone, setZone, stage, configuration } = zoneContext;
  return {
    regions: zone.regions,
    setRegions: (regions: Region[]) =>
      setZone(zone.id === zoneId ? { ...zone, regions: regions } : zone),
    zone,
    stage,
    configuration,
  };
}
