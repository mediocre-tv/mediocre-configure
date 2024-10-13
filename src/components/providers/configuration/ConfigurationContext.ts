import {
  Transform,
  TransformImageToImage,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { createContext } from "react";

export interface BaseConfiguration {
  name: string;
  videoName: string;
  videoUrl: string;
}

export interface StageTest {
  start: number;
  times: number[];
  end: number;
}

export interface StageConfiguration {
  id: string;
  name: string;
  zoneIds: string[];
  tests: StageTest[];
}

export type StageConfigurations = Map<string, StageConfiguration>;

export interface ZoneTest {
  time: number;
  visible: boolean;
}

export interface StagePath {
  stageId: string;
}

export interface ZoneConfiguration {
  id: string;
  name: string;
  stagePaths: StagePath[];
  regionIds: string[];
  transforms: TransformImageToImage[];
  tests: ZoneTest[];
}

export type ZoneConfigurations = Map<string, ZoneConfiguration>;

export interface RegionTest {
  time: number;
  value: string;
}

export interface ZonePath extends StagePath {
  zoneId: string;
}

export interface RegionConfiguration {
  id: string;
  name: string;
  zonePaths: ZonePath[];
  transforms: Transform[];
  tests: RegionTest[];
}

export type RegionConfigurations = Map<string, RegionConfiguration>;

export interface ConfigurationContextProps {
  configuration: BaseConfiguration;
  setConfiguration: (configuration: BaseConfiguration) => void;
  stages: StageConfigurations;
  setStages: (stages: StageConfigurations) => void;
  zones: ZoneConfigurations;
  setZones: (zones: ZoneConfigurations) => void;
  regions: RegionConfigurations;
  setRegions: (regions: RegionConfigurations) => void;
}

export const ConfigurationContext =
  createContext<ConfigurationContextProps | null>(null);
