import { useStage, useStages } from "../configuration/useStage.ts";
import { useConfigurationTest } from "./useConfigurationTest.ts";
import { ExpectedStage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { useEffect, useMemo } from "react";

export function useStageTest(id: string | undefined) {
  const stageContext = useStage(id);
  const { stageTests, setStageTests, test } = useStageTests();

  const defaultStageTestContext = useMemo(
    () => ({
      stageTest: ExpectedStage.create({ id: id }),
      setStageTest: (stageTest: ExpectedStage) =>
        setStageTests([...stageTests, stageTest]),
      test: test,
      ...stageContext,
    }),
    [id, setStageTests, stageContext, stageTests, test],
  );

  const index = stageTests.findIndex((stageTest) => stageTest.id === id);

  useEffect(() => {
    if (index === -1) {
      defaultStageTestContext.setStageTest(defaultStageTestContext.stageTest);
    }
  }, [defaultStageTestContext, index]);

  if (index === -1) {
    return defaultStageTestContext;
  }

  return {
    stageTest: stageTests[index],
    setStageTest: (stageTest: ExpectedStage) => {
      const splicedStageTests = stageTests;
      splicedStageTests.splice(index, 1, stageTest);
      setStageTests(splicedStageTests);
    },
    test: test,
    ...stageContext,
  };
}

export function useStageTests() {
  const { test, setTest } = useConfigurationTest();
  const stagesContext = useStages();

  return {
    stageTests: test.stages,
    setStageTests: (stages: ExpectedStage[]) =>
      setTest({
        ...test,
        stages: stages,
      }),
    test: test,
    ...stagesContext,
  };
}
