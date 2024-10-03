import { useContext } from "react";
import { ConfigurationContext } from "./ConfigurationContext";

export function useConfiguration() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    return null;
  }

  const { configuration, setConfiguration } = configurationContext;
  return {
    configuration,
    setConfiguration,
  };
}
