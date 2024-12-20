import { PropsWithChildren } from "react";
import {
  BaseConfiguration,
  ConfigurationContext,
  RegionConfiguration,
  RegionConfigurations,
  StageConfiguration,
  StageConfigurations,
  ZoneConfiguration,
  ZoneConfigurations,
} from "./ConfigurationContext.ts";
import {
  GameConfiguration,
  Stage,
  Zone,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/game_pb";
import {
  RegionTest,
  TestConfiguration,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/test_pb";

export interface ConfigurationProviderProps {
  gameConfiguration: GameConfiguration;
  setGameConfiguration: (configuration: GameConfiguration) => void;
  testConfiguration: TestConfiguration;
  setTestConfiguration: (configuration: TestConfiguration) => void;
}

export function ConfigurationProvider({
  children,
  gameConfiguration,
  setGameConfiguration,
  testConfiguration,
  setTestConfiguration,
}: PropsWithChildren<ConfigurationProviderProps>) {
  if (!testConfiguration.video) {
    throw new Error("Video should have been provided");
  }

  const configuration: BaseConfiguration = {
    name: gameConfiguration.name,
    videoName: testConfiguration.video.name,
    videoUrl: testConfiguration.video.url,
  };

  const setConfiguration = (configuration: BaseConfiguration) => {
    setGameConfiguration({
      ...gameConfiguration,
      name: configuration.name,
    });
    setTestConfiguration({
      ...testConfiguration,
      video: { name: configuration.videoName, url: configuration.videoUrl },
    });
  };

  const stages: StageConfigurations = new Map(
    gameConfiguration.stages.map(
      ({ id, name, zoneIds }): [id: string, stage: StageConfiguration] => {
        const testsOrEmpty =
          testConfiguration.stagesTests.find((test) => test.stageId === id)
            ?.tests ?? [];
        const tests = testsOrEmpty
          .map(({ start, end, timestamps }) => ({
            start,
            end,
            times: timestamps.sort((a, b) => a - b),
          }))
          .sort((a, b) => a.start - b.start);
        return [id, { id, name, zoneIds, tests }];
      },
    ),
  );

  const setStages = (stages: StageConfigurations) => {
    setGameConfiguration({
      ...gameConfiguration,
      stages: Array.from(stages).map(
        ([id, { name, zoneIds }]): Stage => ({
          id,
          name,
          zoneIds,
        }),
      ),
    });
    setTestConfiguration({
      ...testConfiguration,
      stagesTests: Array.from(stages).map(([id, { tests }]) => ({
        stageId: id,
        tests: tests
          .sort((a, b) => a.start - b.start)
          .map((test) => ({
            start: test.start,
            end: test.end,
            timestamps: test.times.sort((a, b) => a - b),
          })),
      })),
    });
  };

  const zones: ZoneConfigurations = new Map(
    gameConfiguration.zones.map(
      ({
        id,
        name,
        regionIds,
        transformations,
      }): [id: string, zone: ZoneConfiguration] => {
        const stagePaths = Array.from(stages.values())
          .filter((stage) => stage.zoneIds.includes(id))
          .map(({ id }) => ({ stageId: id }));
        const testsOrEmpty =
          testConfiguration.zonesTests.find((test) => test.zoneId === id)
            ?.tests ?? [];
        const tests = testsOrEmpty
          .map(({ timestamp, visible }) => ({
            time: timestamp,
            visible,
          }))
          .sort((a, b) => a.time - b.time);
        return [
          id,
          {
            id,
            name,
            stagePaths,
            regionIds,
            transforms: transformations,
            tests,
          },
        ];
      },
    ),
  );

  const setZones = (zones: ZoneConfigurations) => {
    setGameConfiguration({
      ...gameConfiguration,
      stages: gameConfiguration.stages.map(
        (stage): Stage => ({
          ...stage,
          zoneIds: Array.from(zones.values())
            .filter(({ stagePaths }) => {
              return stagePaths.some(({ stageId }) => stageId === stage.id);
            })
            .map(({ id }) => id),
        }),
      ),
      zones: Array.from(zones).map(([id, { name, regionIds, transforms }]) => ({
        id,
        name,
        regionIds,
        transformations: transforms,
      })),
    });
    setTestConfiguration({
      ...testConfiguration,
      zonesTests: Array.from(zones).map(([id, { tests }]) => ({
        zoneId: id,
        tests: tests
          .sort((a, b) => a.time - b.time)
          .map((test) => ({
            timestamp: test.time,
            visible: test.visible,
          })),
      })),
    });
  };

  const regions: RegionConfigurations = new Map(
    gameConfiguration.regions.map(
      ({
        id,
        name,
        transformations,
      }): [id: string, region: RegionConfiguration] => {
        const zonePaths = Array.from(zones.values())
          .filter((zone) => zone.regionIds.includes(id))
          .flatMap(({ id, stagePaths }) =>
            stagePaths.map((stagePath) => ({ ...stagePath, zoneId: id })),
          );
        const testsOrEmpty =
          testConfiguration.regionsTests.find((test) => test.regionId === id)
            ?.tests ?? [];
        const tests = testsOrEmpty
          .filter(isCharactersTest)
          .map(mapToRegionTest)
          .sort((a, b) => a.time - b.time);
        return [
          id,
          { id, name, zonePaths, transforms: transformations, tests },
        ];
      },
    ),
  );

  const setRegions = (regions: RegionConfigurations) => {
    setGameConfiguration({
      ...gameConfiguration,
      zones: gameConfiguration.zones.map(
        (zone): Zone => ({
          ...zone,
          regionIds: Array.from(regions.values())
            .filter(({ zonePaths }) => {
              return zonePaths.some(({ zoneId }) => zoneId === zone.id);
            })
            .map(({ id }) => id),
        }),
      ),
      regions: Array.from(regions).map(([id, { name, transforms }]) => ({
        id,
        name,
        transformations: transforms,
      })),
    });
    setTestConfiguration({
      ...testConfiguration,
      regionsTests: Array.from(regions).map(([id, { tests }]) => ({
        regionId: id,
        tests: tests
          .sort((a, b) => a.time - b.time)
          .map((test) => ({
            timestamp: test.time,
            value: {
              value: {
                oneofKind: "characters",
                characters: test.value,
              },
            },
          })),
      })),
    });
  };

  return (
    <ConfigurationContext.Provider
      value={{
        configuration,
        setConfiguration,
        stages,
        setStages,
        zones,
        setZones,
        regions,
        setRegions,
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
}

interface CharactersTest {
  timestamp: number;
  value: { value: { oneofKind: "characters"; characters: string } };
}

function isCharactersTest(test: RegionTest): test is CharactersTest {
  return test.value?.value.oneofKind === "characters";
}

function mapToRegionTest({
  timestamp,
  value: {
    value: { characters },
  },
}: CharactersTest) {
  return { time: timestamp, value: characters };
}
