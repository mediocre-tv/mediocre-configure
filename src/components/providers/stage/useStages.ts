import { useContext } from "react";
import { ConfigurationContext } from "../configuration/ConfigurationContext.ts";

export function useStages() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    throw new Error("No stage context");
  }

  const { stages, setStages } = configurationContext;
  return {
    stages,
    setStages,
  };
}
