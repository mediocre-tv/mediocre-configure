import { StyledEngineProvider } from "@mui/material";
import { PropsWithChildren } from "react";

export default function AppProviders({ children }: PropsWithChildren) {
  return <StyledEngineProvider injectFirst>{children}</StyledEngineProvider>;
}
