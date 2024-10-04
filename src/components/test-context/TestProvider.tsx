import { Test } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { PropsWithChildren } from "react";
import { TestContext } from "./TestContext.ts";
import { Typography } from "@mui/material";

export interface TestProviderProps {
  test: Test | null;
  setTest: (test: Test) => void;
}

export function TestProvider({
  children,
  test,
  setTest,
}: PropsWithChildren<TestProviderProps>) {
  if (!test) {
    return <Typography>No test context provided</Typography>;
  }

  return (
    <TestContext.Provider value={{ test, setTest }}>
      {children}
    </TestContext.Provider>
  );
}
