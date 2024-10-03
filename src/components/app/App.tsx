import AppProviders from "../app-providers/AppProviders.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import GrpcProviderWithDialog from "../grpc/GrpcProviderWithDialog.tsx";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Configuration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { v4 as uuid } from "uuid";
import { StagesEditor } from "../stages-editor/StagesEditor.tsx";
import { ConfigurationProvider } from "../configuration/ConfigurationProvider.tsx";

function getDefaultConfiguration(): Configuration {
  return {
    id: uuid(),
    name: "New Configuration",
    stages: [],
  };
}

function App() {
  const [configuration, setConfiguration] = useLocalState<Configuration>(
    getDefaultConfiguration(),
    "configuration",
  );

  return (
    <AppProviders>
      <GrpcProviderWithDialog>
        <RegionEditor />
      </GrpcProviderWithDialog>
    </AppProviders>
  );
}

export default App;
