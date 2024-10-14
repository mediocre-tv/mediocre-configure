import { createContext } from "react";
import { CustomMap, CustomMapEntry } from "../../../../classes/CustomMap.ts";
import {
  RegionResultOrError,
  RegionResultsKey,
  regionResultsKeyEquals,
  regionResultsValueEquals,
} from "../region-results/RegionResultsContext.ts";

export type RegionResultEntry = CustomMapEntry<
  RegionResultsKey,
  RegionResultOrError
>;

export class RegionResultMap extends CustomMap<
  RegionResultsKey,
  RegionResultOrError
> {
  constructor(entries?: RegionResultEntry[]) {
    super(
      regionResultsKeyEquals,
      (a, b) => regionResultsValueEquals([a], [b]),
      entries,
    );
  }
}

export interface RegionResultContextProps {
  results: RegionResultMap;
}

export const RegionResultContext =
  createContext<RegionResultContextProps | null>(null);
