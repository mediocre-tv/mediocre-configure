import { createContext } from "react";
import { Test } from "../../../../mediocre-service/@buf/typescript/mediocre/test/v1beta/test_pb";

export interface TestContextProps {
  test: Test;
  setTest: (test: Test) => void;
}

export const TestContext = createContext<TestContextProps | null>(null);
