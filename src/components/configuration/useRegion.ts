import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useZone } from "./useZone.ts";
import { useStages } from "./useStage.ts";

export function useRegion(id: string | undefined) {
  const { stages } = useStages();

  const foundStage = stages.find((stage) =>
    stage.zones.some((zone) => zone.regions.some((region) => region.id === id)),
  );
  if (!foundStage) {
    throw new Error(`No stage found for region id ${id}`);
  }

  const foundZone = foundStage.zones.find((zone) =>
    zone.regions.some((region) => region.id === id),
  );
  if (!foundZone) {
    throw new Error(`No zone found for region id ${id}`);
  }

  const { regions, setRegions, zone, stage, configuration } = useRegions(
    foundZone.id,
  );

  const index = regions.findIndex((region) => region.id === id);
  if (index === -1) {
    throw new Error(`No region found for id ${id}`);
  }

  return {
    region: regions[index],
    setRegion: (region: Region) => {
      const splicedRegions = regions;
      splicedRegions.splice(index, 1, region);
      setRegions(splicedRegions);
    },
    zone,
    stage,
    configuration,
  };
}

export function useRegions(zoneId: string | undefined) {
  const { zone, setZone, stage, configuration } = useZone(zoneId);
  return {
    regions: zone.regions,
    setRegions: (regions: Region[]) =>
      setZone(zone.id === zoneId ? { ...zone, regions: regions } : zone),
    zone,
    stage,
    configuration,
  };
}
