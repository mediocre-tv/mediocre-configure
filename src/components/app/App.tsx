import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { GameConfiguration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/game_pb";
import { v4 as uuid } from "uuid";
import {
  TestConfiguration,
  Video,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/test_pb";
import AppProviders from "../providers/app/AppProviders.tsx";
import GrpcProviderWithDialog from "../providers/grpc/GrpcProviderWithDialog.tsx";
import { ConfigurationProvider } from "../providers/configuration/ConfigurationProvider.tsx";
import { FrameProvider } from "../providers/frame/FrameProvider.tsx";
import { VideoProvider } from "../providers/video/VideoProvider.tsx";
import { getRandomTimestamps } from "../video/GrabFrames.ts";
import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout.tsx";
import { ResultsProviders } from "../providers/transform-results/ResultsProvider.tsx";

function getDefaultGameConfiguration(): GameConfiguration {
  return {
    id: uuid(),
    name: "New Configuration",
    stages: [
      {
        id: uuid(),
        name: "New Stage",
        zoneIds: [],
      },
    ],
    zones: [],
    regions: [],
  };
}

function getDefaultTestConfiguration(
  configuration: GameConfiguration,
): TestConfiguration {
  return {
    id: uuid(),
    configurationId: configuration.id,
    video: undefined,
    stagesTests: [],
    zonesTests: [],
    regionsTests: [],
  };
}

function App() {
  const [gameConfiguration, setGameConfiguration] =
    useLocalState<GameConfiguration>(
      getDefaultGameConfiguration(),
      "game-configuration",
    );
  const [testConfiguration, setTestConfiguration] =
    useLocalState<TestConfiguration>(
      getDefaultTestConfiguration(gameConfiguration),
      "test-configuration",
    );

  return (
    <AppProviders>
      <GrpcProviderWithDialog>
        <VideoProvider video={testConfiguration.video} setVideo={setVideo}>
          <ConfigurationProvider
            gameConfiguration={gameConfiguration}
            setGameConfiguration={setGameConfiguration}
            testConfiguration={testConfiguration}
            setTestConfiguration={setTestConfiguration}
          >
            <FrameProvider>
              <ResultsProviders>
                <AppLayout>
                  <Outlet />
                </AppLayout>
              </ResultsProviders>
            </FrameProvider>
          </ConfigurationProvider>
        </VideoProvider>
      </GrpcProviderWithDialog>
    </AppProviders>
  );

  function setVideo(video: Video, duration: number) {
    const stagesTests =
      testConfiguration.stagesTests.length > 0
        ? testConfiguration.stagesTests
        : [
            {
              stageId: gameConfiguration.stages[0].id,
              tests: [
                {
                  start: 0,
                  end: duration,
                  timestamps: getRandomTimestamps(0, duration, 10),
                },
              ],
            },
          ];

    return setTestConfiguration({
      ...testConfiguration,
      video: video,
      stagesTests: stagesTests,
    });
  }
}

export default App;
