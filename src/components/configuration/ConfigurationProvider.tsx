import { PropsWithChildren } from "react";
import { ConfigurationContext } from "./ConfigurationContext.ts";
import { Configuration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";

export interface ConfigurationProviderProps {
  configuration: Configuration;
  setConfiguration: (configuration: Configuration) => void;
}

export function ConfigurationProvider({
  children,
  configuration,
  setConfiguration,
}: PropsWithChildren<ConfigurationProviderProps>) {
  return (
    <ConfigurationContext.Provider value={{ configuration, setConfiguration }}>
      {children}
    </ConfigurationContext.Provider>
  );
}
