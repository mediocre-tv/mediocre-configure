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
import useDefaultGrpcContext from "../grpc/useDefaultGrpcContext.tsx";
import { Box } from "@mui/material";

function App() {
  const [loadingDefaultContext, defaultContext] = useDefaultGrpcContext();
  const [customContext, setCustomContext] = useState<GrpcContextProps | null>(
    null,
  );

  const context = defaultContext || customContext;

  return (
    <AppProviders>
      <Box height="100%" justifyContent="center" alignItems="center">
        {!loadingDefaultContext && !context ? (
          <GrpcConfig context={customContext} setContext={setCustomContext} />
        ) : (
          <GrpcProvider context={context}>
            <RegionEditor />
          </GrpcProvider>
        )}
      </Box>
    </AppProviders>
  );
}

export default App;
