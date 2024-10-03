import { useZone } from "../configuration/useZone.ts";
import { ExpectedZone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { useStageTest } from "./useStageTest.ts";

export function useZoneTest(id: string | undefined) {
  const zoneContext = useZone(id);
  const zoneTestsContext = useZoneTests(zoneContext?.stage.id);
  if (!zoneContext || !zoneTestsContext) {
    return null;
  }

  const { zoneTests, setZoneTests } = zoneTestsContext;
  const index = zoneTests.findIndex((zoneTest) => zoneTest.id === id);
  if (index !== -1) {
    return null;
  }

  return {
    zoneTest: zoneTests[index],
    setZoneTest: (zoneTest: ExpectedZone) =>
      setZoneTests(zoneTests.splice(index, 1, zoneTest)),
    ...zoneContext,
  };
}

export function useZoneTests(stageId: string | undefined) {
  const stageTestContext = useStageTest(stageId);
  if (!stageTestContext) {
    return null;
  }

  const { stageTest, setStageTest, configuration } = stageTestContext;
  return {
    zoneTests: stageTest.zones,
    setZoneTests: (zones: ExpectedZone[]) =>
      setStageTest({
        ...stageTest,
        zones: zones,
      }),
    configuration,
  };
}
