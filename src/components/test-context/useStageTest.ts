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
  const stageTest = stageTests.find((stageTest) => stageTest.id === id);
  if (!stageTest) {
    return null;
  }

  function setStageTest(stageTestToSet: ExpectedStage) {
    const index = stageTests.findIndex((stageTest) => stageTest.id === id);
    if (index !== -1) {
      setStageTests(stageTests.splice(index, 1, stageTestToSet));
    } else {
      setStageTests([...stageTests, stageTestToSet]);
    }
  }

  return {
    stageTest,
    setStageTest,
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
