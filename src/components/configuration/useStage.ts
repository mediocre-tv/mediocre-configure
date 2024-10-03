import { Stage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useConfiguration } from "./useConfiguration";

export function useStage(id: string | undefined) {
  const stageContext = useConfiguration();
  if (!stageContext || !id) {
    return null;
  }

  function findStage(id: string) {
    return configuration.stages.find((s) => s.id === id);
  }

  const { configuration, setConfiguration } = stageContext;
  const stage = findStage(id);
  if (!stage) {
    return null;
  }

  function setStage(newStage: Stage) {
    if (!findStage(newStage.id)) {
      setConfiguration({
        ...configuration,
        stages: [...configuration.stages, newStage],
      });
    } else {
      setConfiguration({
        ...configuration,
        stages: configuration.stages.map((stage) =>
          stage.id === id ? newStage : stage,
        ),
      });
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
