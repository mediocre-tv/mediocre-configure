import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { GameConfiguration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/game_pb";
import { v4 as uuid } from "uuid";
import { StagesEditor } from "../stages-editor/StagesEditor.tsx";
import { TestConfiguration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/test_pb";
import AppProviders from "../providers/app/AppProviders.tsx";
import GrpcProviderWithDialog from "../providers/grpc/GrpcProviderWithDialog.tsx";
import { ConfigurationProvider } from "../providers/configuration/ConfigurationProvider.tsx";
import { FrameProvider } from "../providers/frame/FrameProvider.tsx";
import { TransformResultsProvider } from "../providers/transform-results/TransformResultsProvider.tsx";

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
    stagesTests: [
      {
        stageId: configuration.stages[0].id,
        tests: [
          {
            start: 0,
            end: 340,
            timestamps: [1, 10, 50, 100, 150, 200, 250, 300, 320, 339],
          },
        ],
      },
    ],
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
        <ConfigurationProvider
          gameConfiguration={gameConfiguration}
          setGameConfiguration={setGameConfiguration}
          testConfiguration={testConfiguration}
          setTestConfiguration={setTestConfiguration}
        >
          <FrameProvider>
            <TransformResultsProvider>
              <StagesEditor />
            </TransformResultsProvider>
          </FrameProvider>
        </ConfigurationProvider>
      </GrpcProviderWithDialog>
    </AppProviders>
  );
}

export default App;
