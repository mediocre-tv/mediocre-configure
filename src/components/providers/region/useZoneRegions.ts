import {
  RegionConfiguration,
  RegionConfigurations,
} from "../configuration/ConfigurationContext.ts";
import { useZone } from "../zone/useZone.ts";
import { useRegions } from "./useRegions.ts";

export function useZoneRegions() {
  const { zone } = useZone();
  const { regions, setRegions } = useRegions();

  const zoneRegions: RegionConfigurations = new Map(
    Array.from(regions).filter(([, region]) =>
      region.zonePaths.some((zonePath) => zonePath.zoneId === zone.id),
    ),
  );

  const nonZoneRegions: RegionConfigurations = new Map(
    Array.from(regions).filter(([id]) => !zoneRegions.has(id)),
  );

  const setZoneRegions = (newZoneRegions: RegionConfigurations) => {
    const updatedRegions = new Map(
      Array.from(regions)
        .map(([id]) => [id, newZoneRegions.get(id) || nonZoneRegions.get(id)])
        .filter(
          (region): region is [id: string, region: RegionConfiguration] =>
            region[1] !== undefined,
        ),
    );
    const newRegions = Array.from(newZoneRegions).filter(
      ([id]) => !updatedRegions.has(id),
    );

    setRegions(new Map([...updatedRegions, ...newRegions]));
  };

  return {
    zone: zone,
    regions: zoneRegions,
    setRegions: setZoneRegions,
  };
}
