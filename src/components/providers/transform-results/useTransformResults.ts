import { useContext } from "react";
import {
  TransformResultsContext,
  TransformResultsKey,
} from "./TransformResultsContext.ts";

export function useTransformResults(key: TransformResultsKey) {
  const transformResultsContext = useContext(TransformResultsContext);
  if (!transformResultsContext) {
    throw new Error("No transform results context");
  }

  const { transformResults } = transformResultsContext;

  return {
    transformResults: transformResults.get(key) ?? [],
  };
}
