import { useZone, useZones } from "../configuration/useZone.ts";
import { ExpectedZone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { useStageTest } from "./useStageTest.ts";
import { useEffect, useMemo } from "react";

export function useZoneTest(id: string | undefined) {
  const zoneContext = useZone(id);
  const { zoneTests, setZoneTests, test } = useZoneTests(zoneContext.stage.id);

  const defaultZoneTestContext = useMemo(
    () => ({
      zoneTest: ExpectedZone.create({ id: id }),
      setZoneTest: (stageTest: ExpectedZone) =>
        setZoneTests([...zoneTests, stageTest]),
      test: test,
      ...zoneContext,
    }),
    [id, setZoneTests, zoneContext, zoneTests, test],
  );

  const index = zoneTests.findIndex((zoneTest) => zoneTest.id === id);

  useEffect(() => {
    if (index === -1) {
      defaultZoneTestContext.setZoneTest(defaultZoneTestContext.zoneTest);
    }
  }, [defaultZoneTestContext, index]);

  if (index === -1) {
    return defaultZoneTestContext;
  }

  return {
    zoneTest: zoneTests[index],
    setZoneTest: (zoneTest: ExpectedZone) => {
      const splicedZoneTests = zoneTests;
      splicedZoneTests.splice(index, 1, zoneTest);
      setZoneTests(splicedZoneTests);
    },
    test: test,
    ...zoneContext,
  };
}

export function useZoneTests(stageId: string | undefined) {
  const { stageTest, setStageTest, test } = useStageTest(stageId);
  const zonesContext = useZones(stageId);
  return {
    zoneTests: stageTest.zones,
    setZoneTests: (zones: ExpectedZone[]) =>
      setStageTest({
        ...stageTest,
        zones: zones,
      }),
    test: test,
    ...zonesContext,
  };
}
