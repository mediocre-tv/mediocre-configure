import { useContext } from "react";
import { ConfigurationContext } from "./ConfigurationContext";

export function useConfiguration() {
  return useContext(ConfigurationContext);
}
