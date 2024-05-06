import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { PropsWithChildren } from "react";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline enableColorScheme />
      {children}
    </StyledEngineProvider>
  );
}
