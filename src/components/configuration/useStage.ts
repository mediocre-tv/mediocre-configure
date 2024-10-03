import { Stage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useConfiguration } from "./useConfiguration";

export function useStage(id: string | undefined) {
  const stagesContext = useStages();
  if (!stagesContext) {
    return null;
  }

  const { stages, setStages, configuration } = stagesContext;
  const index = stages.findIndex((stage) => stage.id === id);
  if (index !== -1) {
    return null;
  }

  return {
    stage: stages[index],
    setStage: (stage: Stage) => setStages(stages.splice(index, 1, stage)),
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
