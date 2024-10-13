import { useContext } from "react";
import { RegionContext } from "./RegionContext.ts";
import {
  ConfigurationContext,
  RegionConfiguration,
} from "../configuration/ConfigurationContext.ts";

export function useRegion() {
  const configurationContext = useContext(ConfigurationContext);
  const regionContext = useContext(RegionContext);
  if (!configurationContext || !regionContext) {
    throw new Error("No region context");
  }

  const { id } = regionContext;
  const { regions, setRegions } = configurationContext;

  const region = regions.get(id);
  if (!region) {
    throw new Error(`No region for id: ${regionContext.id}`);
  }

  const setRegion = (region: RegionConfiguration) => {
    setRegions(regions.set(id, region));
  };

  const deleteRegion = () => {
    regions.delete(id);
    setRegions(regions);
  };

  return {
    region,
    setRegion,
    deleteRegion,
  };
}
