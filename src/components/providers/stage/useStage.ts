import { useContext } from "react";
import { StageContext } from "./StageContext.ts";
import {
  ConfigurationContext,
  StageConfiguration,
} from "../configuration/ConfigurationContext.ts";

export function useStage() {
  const configurationContext = useContext(ConfigurationContext);
  const stageContext = useContext(StageContext);
  if (!configurationContext || !stageContext) {
    throw new Error("No stage context");
  }

  const { id } = stageContext;
  const { stages, setStages } = configurationContext;

  const stage = stages.get(id);
  if (!stage) {
    throw new Error(`No stage for id: ${id}`);
  }

  const setStage = (stage: StageConfiguration) => {
    setStages(stages.set(id, stage));
  };

  const deleteStage = () => {
    stages.delete(id);
    setStages(stages);
  };

  return {
    stage,
    setStage,
    deleteStage,
  };
}
