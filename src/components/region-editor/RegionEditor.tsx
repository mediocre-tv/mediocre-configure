import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import { useState } from "react";
import { Box, Stack } from "@mui/material";

export default function RegionEditor() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  return (
    <Stack height="100%" justifyContent="center" alignItems="center">
      <ImageLabeller
        image={snapshotImage}
        rectangles={rectangles}
        setRectangles={setRectangles}
        selectedRectangleId={selectedRectangleId}
        setSelectedRectangleId={setSelectedRectangleId}
      />
      <Box>
        Selected rectangle: {selectedRectangleId}{" "}
        {selectedRectangleId &&
          `: ${JSON.stringify(rectangles[selectedRectangleId])}`}
      </Box>
    </Stack>
  );
}
