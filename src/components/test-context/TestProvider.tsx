import { Test } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { PropsWithChildren } from "react";
import { TestContext } from "./TestContext.ts";

export interface TestProviderProps {
  test: Test | null;
  setTest: (test: Test) => void;
}

export function TestProvider({
  children,
  test,
  setTest,
}: PropsWithChildren<TestProviderProps>) {
  return (
    <TestContext.Provider value={test ? { test, setTest } : null}>
      {children}
    </TestContext.Provider>
  );
}
