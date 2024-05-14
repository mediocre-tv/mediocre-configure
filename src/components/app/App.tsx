import AppProviders from "../app-providers/AppProviders.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import RegionEditor from "../region-editor/RegionEditor.tsx";
import GrpcProviderWithDialog from "../grpc/GrpcProviderWithDialog.tsx";

function App() {
  return (
    <AppProviders>
      <GrpcProviderWithDialog>
        <RegionEditor />
      </GrpcProviderWithDialog>
    </AppProviders>
  );
}

export default App;
