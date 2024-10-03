import { Configuration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { createContext } from "react";

export interface ConfigurationContextProps {
  configuration: Configuration;
  setConfiguration: (configuration: Configuration) => void;
}

export const ConfigurationContext =
  createContext<ConfigurationContextProps | null>(null);
