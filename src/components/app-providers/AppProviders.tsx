import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { PropsWithChildren } from "react";

function MaterialProviders({ children }: PropsWithChildren) {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline enableColorScheme />
      {children}
    </StyledEngineProvider>
  );
}

export default function AppProviders({ children }: PropsWithChildren) {
  return <MaterialProviders>{children}</MaterialProviders>;
}
