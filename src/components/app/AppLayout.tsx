import { PropsWithChildren, useContext } from "react";
import { AppBar, Box, Breadcrumbs, Stack, Toolbar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useExpandId } from "../providers/hooks/useExpandId";
import { ConfigurationContext } from "../providers/configuration/ConfigurationContext.ts";

export function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const expandId = useExpandId();
  const configurationContext = useContext(ConfigurationContext);

  if (!configurationContext) {
    throw new Error("No configuration context found");
  }

  const stagesMatch = location.pathname.match(/stages\/([^/]+)/);
  const zonesMatch = location.pathname.match(/zones\/([^/]+)/);
  const regionsMatch = location.pathname.match(/regions\/([^/]+)/);

  const stageId = stagesMatch ? stagesMatch[1] : null;
  const zoneId = zonesMatch ? zonesMatch[1] : null;
  const regionId = regionsMatch ? regionsMatch[1] : null;

  const { stages, zones, regions } = configurationContext;

  const stage = stageId ? (stages.get(expandId(stageId)) ?? null) : null;
  const zone = zoneId ? (zones.get(expandId(zoneId)) ?? null) : null;
  const region = regionId ? (regions.get(expandId(regionId)) ?? null) : null;

  return (
    <Stack spacing={2}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Breadcrumbs aria-label="breadcrumb">
              <StyledLink to={"/stages"}>Stages</StyledLink>
              {stage && (
                <StyledLink to={`/stages/${stageId}/zones`}>
                  {stage.name}
                </StyledLink>
              )}
              {zone && (
                <StyledLink to={`/stages/${stageId}/zones/${zoneId}/regions`}>
                  {zone.name}
                </StyledLink>
              )}
              {region && (
                <StyledLink
                  to={`/stages/${stageId}/zones/${zoneId}/regions/${regionId}`}
                >
                  {region.name}
                </StyledLink>
              )}
            </Breadcrumbs>
          </Toolbar>
        </AppBar>
      </Box>
      {children}
    </Stack>
  );
}

interface StyledLinkProps extends PropsWithChildren {
  to: string;
}

function StyledLink({ to, children }: StyledLinkProps) {
  return (
    <Link to={to} style={{ color: "white", textDecoration: "none" }}>
      {children}
    </Link>
  );
}
