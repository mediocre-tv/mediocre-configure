import { useContext } from "react";
import { TestContext } from "./TestContext.ts";
import { useConfiguration } from "../configuration/useConfiguration.ts";

export function useConfigurationTest() {
  const configurationContext = useConfiguration();
  const testContext = useContext(TestContext);
  if (!configurationContext || !testContext) {
    return null;
  }

  const { test, setTest } = testContext;
  return {
    test,
    setTest,
    ...configurationContext,
  };
}
