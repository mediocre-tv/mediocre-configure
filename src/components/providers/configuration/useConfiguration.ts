import { useContext } from "react";
import { ConfigurationContext } from "./ConfigurationContext.ts";

export function useConfiguration() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    throw new Error("No configuration context");
  }

  return configurationContext;
}
