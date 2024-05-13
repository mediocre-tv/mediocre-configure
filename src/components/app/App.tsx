import styles from "./App.module.css";
import { useState } from "react";
import GrpcConfig from "../grpc/GrpcConfig.tsx";
import AppProviders from "../app-providers/AppProviders.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import GrpcProvider from "../grpc/GrpcProvider.tsx";
import { GrpcContextProps } from "../grpc/GrpcContext.tsx";
import RegionEditor from "../region-editor/RegionEditor.tsx";

function App() {
  const [grpcContext, setGrpcContext] = useState<GrpcContextProps | null>(null);

  return (
    <AppProviders>
      <div className={styles.container}>
        {grpcContext ? (
          <GrpcProvider context={grpcContext}>
            <RegionEditor />
          </GrpcProvider>
        ) : (
          <GrpcConfig context={grpcContext} setContext={setGrpcContext} />
        )}
      </div>
    </AppProviders>
  );
}

export default App;
