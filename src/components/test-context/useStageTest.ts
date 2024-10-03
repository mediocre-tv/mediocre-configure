import { useStage } from "../configuration/useStage.ts";
import { useConfigurationTest } from "./useConfigurationTest.ts";
import { ExpectedStage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";

export function useStageTest(id: string | undefined) {
  const stageContext = useStage(id);
  const stageTestsContext = useStageTests();
  if (!stageContext || !stageTestsContext) {
    return null;
  }

  const { stageTests, setStageTests } = stageTestsContext;
  const index = stageTests.findIndex((stageTest) => stageTest.id === id);
  if (index !== -1) {
    return null;
  }

  return {
    stageTest: stageTests[index],
    setStageTest: (stageTest: ExpectedStage) =>
      setStageTests(stageTests.splice(index, 1, stageTest)),
    ...stageContext,
  };
}

export function useStageTests() {
  const configurationTestContext = useConfigurationTest();
  if (!configurationTestContext) {
    return null;
  }

  const { test, setTest, configuration } = configurationTestContext;
  return {
    stageTests: test.stages,
    setStageTests: (stages: ExpectedStage[]) =>
      setTest({
        ...test,
        stages: stages,
      }),
    configuration,
  };
}
