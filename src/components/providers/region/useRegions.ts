import { useContext } from "react";
import { ConfigurationContext } from "../configuration/ConfigurationContext.ts";

export function useRegions() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    throw new Error("No region context");
  }

  const { regions, setRegions } = configurationContext;

  return {
    regions: regions,
    setRegions,
  };
}
