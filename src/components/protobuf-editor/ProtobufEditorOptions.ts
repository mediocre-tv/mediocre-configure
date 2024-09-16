import { snakeCase } from "change-case";
import { MediocreOptions } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/options/v1beta/options_pb";
import { FieldInfo } from "@protobuf-ts/runtime";
import { JsonValue } from "@protobuf-ts/runtime/build/types/json-typings";

const optionsKey = MediocreOptions.typeName
  .split(".")
  .map((name) => snakeCase(name))
  .join(".");

export function getOptions(info: FieldInfo) {
  if (!info.options) {
    return null;
  }

  return getMappedOptions(info.options);
}

export function getMappedOptions(options: { [key: string]: JsonValue }) {
  // not particularly safe, but we're expecting this type
  return options[optionsKey] as MediocreOptions;
}
