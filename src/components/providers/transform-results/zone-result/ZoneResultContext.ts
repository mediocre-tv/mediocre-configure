import { createContext } from "react";
import { CustomMap, CustomMapEntry } from "../../../../classes/CustomMap.ts";
import {
  ZoneResultOrError,
  ZoneResultsKey,
  zoneResultsKeyEquals,
  zoneResultsValueEquals,
} from "../zone-results/ZoneResultsContext.ts";

export type ZoneResultEntry = CustomMapEntry<ZoneResultsKey, ZoneResultOrError>;

export class ZoneResultMap extends CustomMap<
  ZoneResultsKey,
  ZoneResultOrError
> {
  constructor(entries?: ZoneResultEntry[]) {
    super(
      zoneResultsKeyEquals,
      (a, b) => zoneResultsValueEquals([a], [b]),
      entries,
    );
  }
}

export interface ZoneResultContextProps {
  results: ZoneResultMap;
}

export const ZoneResultContext = createContext<ZoneResultContextProps | null>(
  null,
);
