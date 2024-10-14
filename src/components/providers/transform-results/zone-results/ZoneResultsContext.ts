import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { createContext } from "react";
import { CustomMap, CustomMapEntry } from "../../../../classes/CustomMap.ts";
import { TransformError, TransformImageResult } from "../TransformResults.ts";

export type ZoneResultOrError = TransformImageResult | TransformError;

export interface ZoneResultsKey {
  stageId: string;
  zoneId: string;
  timestamp: number;
  transforms: Transform[];
}

export type ZoneResultsEntry = CustomMapEntry<
  ZoneResultsKey,
  ZoneResultOrError[]
>;

export class ZoneResultsMap extends CustomMap<
  ZoneResultsKey,
  ZoneResultOrError[]
> {
  constructor(entries?: ZoneResultsEntry[]) {
    super(zoneResultsKeyEquals, zoneResultsValueEquals, entries);
  }
}

export interface ZoneResultsContextProps {
  zoneResults: ZoneResultsMap;
}

export const ZoneResultsContext = createContext<ZoneResultsContextProps | null>(
  null,
);

export function zoneResultsKeyEquals(a: ZoneResultsKey, b: ZoneResultsKey) {
  return (
    a.stageId === b.stageId &&
    a.zoneId === b.zoneId &&
    a.timestamp === b.timestamp &&
    a.transforms.length === b.transforms.length &&
    a.transforms.every((transform, index) =>
      Transform.equals(transform, b.transforms[index]),
    )
  );
}

export function zoneResultsValueEquals(
  a: ZoneResultOrError[],
  b: ZoneResultOrError[],
) {
  return (
    a.length === b.length &&
    a.every((value, index) => {
      const otherValue = b[index];
      return (
        value.elapsed === otherValue.elapsed &&
        (value as TransformError).error ===
          (otherValue as TransformError).error &&
        (value as TransformImageResult).image ===
          (otherValue as TransformImageResult).image
      );
    })
  );
}
