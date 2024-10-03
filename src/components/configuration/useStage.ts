import { Stage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useConfiguration } from "./useConfiguration";

export function useStage(id: string | undefined) {
  const stagesContext = useStages();
  if (!stagesContext) {
    return null;
  }

  const { stages, setStages, configuration } = stagesContext;
  const stage = stages.find((stage) => stage.id === id);
  if (!stage) {
    return null;
  }

  function setStage(stageToSet: Stage) {
    const index = stages.findIndex((stage) => stage.id === id);
    if (index !== -1) {
      setStages(stages.splice(index, 1, stageToSet));
    } else {
      setStages([...stages, stageToSet]);
    }
  }

  return {
    stage,
    setStage,
    configuration,
  };
}

export function useStages() {
  const configurationContext = useConfiguration();
  if (!configurationContext) {
    return null;
  }

  const { configuration, setConfiguration } = configurationContext;
  return {
    stages: configuration.stages,
    setStages: (stages: Stage[]) =>
      setConfiguration({
        ...configuration,
        stages: stages,
      }),
    configuration,
  };
}
