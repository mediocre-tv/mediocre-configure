import { useContext } from "react";
import { ConfigurationContext } from "../configuration/ConfigurationContext.ts";

export function useZones() {
  const configurationContext = useContext(ConfigurationContext);
  if (!configurationContext) {
    throw new Error("No zone context");
  }

  const { zones, setZones } = configurationContext;

  return {
    zones,
    setZones,
  };
}
