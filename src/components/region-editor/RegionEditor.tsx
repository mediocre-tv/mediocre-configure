import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import { useState } from "react";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

export default function RegionEditor() {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  return (
    <Box width={1} height={1} display="flex" justifyContent="center" p={10}>
      <Grid2 container width={1} spacing={10}>
        <Grid2 xs={12} lg={6}>
          <Stack spacing={5}>
            <ImageLabeller
              image={snapshotImage}
              rectangles={rectangles}
              setRectangles={setRectangles}
              selectedRectangleId={selectedRectangleId}
              setSelectedRectangleId={setSelectedRectangleId}
            />
            {selectedRectangleId && (
              <Typography variant="h4">
                Selected rectangle: {selectedRectangleId}
              </Typography>
            )}
          </Stack>
        </Grid2>
        <Grid2 height={1} xs={12} lg={6}>
          <Stack
            height={1}
            spacing={5}
            textAlign={"center"}
            sx={{
              ...(hasLgBreakpoint && {
                overflow: "auto",
              }),
            }}
          >
            {Object.entries(rectangles).map(([id, rectangle]) => (
              <Stack key={id}>
                <Typography variant="h4" gutterBottom>
                  {id}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {JSON.stringify(rectangle)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
}
