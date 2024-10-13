import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { createContext } from "react";
import { CustomMap, CustomMapEntry } from "../../../classes/CustomMap.ts";

export interface TransformError {
  error: string;
  elapsed: number;
}

export interface TransformImageResult {
  image: string;
  elapsed: number;
}

export interface TransformTextResult {
  text: string;
  elapsed: number;
}

export type TransformResultOrError =
  | TransformImageResult
  | TransformTextResult
  | TransformError;

export interface TransformResultsKey {
  stageId: string;
  zoneId?: string;
  regionId?: string;
  timestamp: number;
  transforms: Transform[];
}

export type TransformResultsEntry = CustomMapEntry<
  TransformResultsKey,
  TransformResultOrError[]
>;

export class TransformResults extends CustomMap<
  TransformResultsKey,
  TransformResultOrError[]
> {
  constructor(entries?: TransformResultsEntry[]) {
    super(transformResultsKeyEquals, transformResultsValueEquals, entries);
  }
}

export interface TransformResultsContextProps {
  transformResults: TransformResults;
}

export const TransformResultsContext =
  createContext<TransformResultsContextProps | null>(null);

export function transformResultsKeyEquals(
  a: TransformResultsKey,
  b: TransformResultsKey,
) {
  return (
    a.stageId === b.stageId &&
    a.zoneId === b.zoneId &&
    a.regionId === b.regionId &&
    a.timestamp === b.timestamp &&
    a.transforms.length === b.transforms.length &&
    a.transforms.every((transform, index) =>
      Transform.equals(transform, b.transforms[index]),
    )
  );
}

export function transformResultsKeysEquals(
  a?: TransformResultsKey[],
  b?: TransformResultsKey[],
) {
  return (
    (a === undefined && b === undefined) ||
    (a !== undefined &&
      b !== undefined &&
      a.length === b.length &&
      a.every((key, index) => transformResultsKeyEquals(key, b[index])))
  );
}

export function transformResultsValueEquals(
  a: TransformResultOrError[],
  b: TransformResultOrError[],
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
