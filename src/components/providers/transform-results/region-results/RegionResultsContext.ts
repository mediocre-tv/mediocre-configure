import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { createContext } from "react";
import { CustomMap, CustomMapEntry } from "../../../../classes/CustomMap.ts";
import {
  TransformError,
  TransformImageResult,
  TransformTextResult,
} from "../TransformResults.ts";
import {
  ZoneResultsKey,
  zoneResultsKeyEquals,
} from "../zone-results/ZoneResultsContext.ts";

export type RegionResultOrError =
  | TransformImageResult
  | TransformTextResult
  | TransformError;

export interface RegionResultsKey {
  zoneKey: ZoneResultsKey;
  regionId: string;
  transforms: Transform[];
}

export type RegionResultsEntry = CustomMapEntry<
  RegionResultsKey,
  RegionResultOrError[]
>;

export class RegionResultsMap extends CustomMap<
  RegionResultsKey,
  RegionResultOrError[]
> {
  constructor(entries?: RegionResultsEntry[]) {
    super(regionResultsKeyEquals, regionResultsValueEquals, entries);
  }
}

export interface RegionResultsContextProps {
  regionResults: RegionResultsMap;
}

export const RegionResultsContext =
  createContext<RegionResultsContextProps | null>(null);

export function regionResultsKeyEquals(
  a: RegionResultsKey,
  b: RegionResultsKey,
) {
  return (
    zoneResultsKeyEquals(a.zoneKey, b.zoneKey) &&
    a.regionId === b.regionId &&
    a.transforms.length === b.transforms.length &&
    a.transforms.every((transform, index) =>
      Transform.equals(transform, b.transforms[index]),
    )
  );
}

export function regionResultsValueEquals(
  a: RegionResultOrError[],
  b: RegionResultOrError[],
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
          (otherValue as TransformImageResult).image &&
        (value as TransformTextResult).text ===
          (otherValue as TransformTextResult).text
      );
    })
  );
}
