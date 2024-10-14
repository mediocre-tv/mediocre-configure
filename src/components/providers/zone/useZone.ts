import { useContext } from "react";
import {
  ConfigurationContext,
  ZoneConfiguration,
} from "../configuration/ConfigurationContext.ts";
import { ZoneContext } from "./ZoneContext.ts";

export function useZone() {
  const configurationContext = useContext(ConfigurationContext);
  const zoneContext = useContext(ZoneContext);
  if (!configurationContext || !zoneContext) {
    throw new Error("No zone context");
  }

  const { id } = zoneContext;
  const { zones, setZones } = configurationContext;

  const zone = zones.get(id);
  if (!zone) {
    throw new Error(`No zone for id: ${zoneContext.id}`);
  }

  const setZone = (zone: ZoneConfiguration) => {
    setZones(zones.set(id, zone));
  };

  const deleteZone = () => {
    zones.delete(id);
    setZones(zones);
  };

  return {
    zone,
    setZone,
    deleteZone,
  };
}
