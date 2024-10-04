import { Stage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useConfiguration } from "./useConfiguration";

export function useStage(id: string | undefined) {
  const { stages, setStages, configuration } = useStages();

  const index = stages.findIndex((stage) => stage.id === id);
  if (index === -1) {
    throw new Error(`No stage found for id ${id}`);
  }

  return {
    stage: stages[index],
    setStage: (stage: Stage) => {
      const splicedStages = stages;
      splicedStages.splice(index, 1, stage);
      setStages(splicedStages);
    },
    configuration,
  };
}

export function useStages() {
  const { configuration, setConfiguration } = useConfiguration();
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
