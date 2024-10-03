import { useRegion } from "../configuration/useRegion.ts";
import { ExpectedRegion } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { useZoneTest } from "./useZoneTest.ts";

export function useRegionTest(id: string | undefined) {
  const regionContext = useRegion(id);
  const regionTestsContext = useRegionTests(regionContext?.zone.id);
  if (!regionContext || !regionTestsContext) {
    return null;
  }

  const { regionTests, setRegionTests } = regionTestsContext;
  const index = regionTests.findIndex((regionTest) => regionTest.id === id);
  if (index !== -1) {
    return null;
  }

  return {
    regionTest: regionTests[index],
    setRegionTest: (regionTest: ExpectedRegion) =>
      setRegionTests(regionTests.splice(index, 1, regionTest)),
    ...regionContext,
  };
}

export function useRegionTests(zoneId: string | undefined) {
  const zoneTestContext = useZoneTest(zoneId);
  if (!zoneTestContext) {
    return null;
  }

  const { zoneTest, setZoneTest, configuration } = zoneTestContext;
  return {
    regionTests: zoneTest.regions,
    setRegionTests: (regions: ExpectedRegion[]) =>
      setZoneTest({
        ...zoneTest,
        regions: regions,
      }),
    configuration,
  };
}
