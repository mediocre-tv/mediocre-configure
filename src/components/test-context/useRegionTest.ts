import { useRegion, useRegions } from "../configuration/useRegion.ts";
import { ExpectedRegion } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { useZoneTest } from "./useZoneTest.ts";
import { useEffect, useMemo } from "react";

export function useRegionTest(id: string | undefined) {
  const regionContext = useRegion(id);
  const { regionTests, setRegionTests, test } = useRegionTests(
    regionContext.zone.id,
  );

  const defaultRegionTestContext = useMemo(
    () => ({
      regionTest: ExpectedRegion.create({ id: id }),
      setRegionTest: (regionTest: ExpectedRegion) =>
        setRegionTests([...regionTests, regionTest]),
      test: test,
      ...regionContext,
    }),
    [id, setRegionTests, regionContext, regionTests, test],
  );

  const index = regionTests.findIndex((regionTest) => regionTest.id === id);

  useEffect(() => {
    if (index === -1) {
      defaultRegionTestContext.setRegionTest(
        defaultRegionTestContext.regionTest,
      );
    }
  }, [defaultRegionTestContext, index]);

  if (index === -1) {
    return defaultRegionTestContext;
  }

  return {
    regionTest: regionTests[index],
    setRegionTest: (regionTest: ExpectedRegion) => {
      const splicedRegionTests = regionTests;
      splicedRegionTests.splice(index, 1, regionTest);
      setRegionTests(splicedRegionTests);
    },
    test: test,
    ...regionContext,
  };
}

export function useRegionTests(zoneId: string | undefined) {
  const { zoneTest, setZoneTest, test } = useZoneTest(zoneId);
  const regionsContext = useRegions(zoneId);
  return {
    regionTests: zoneTest.regions,
    setRegionTests: (regions: ExpectedRegion[]) =>
      setZoneTest({
        ...zoneTest,
        regions: regions,
      }),
    test: test,
    ...regionsContext,
  };
}
