import { DragEvent, useState } from "react";
import { Box, Typography } from "@mui/material";

export interface DragDropVideoProps {
  onDropVideo: (name: string, video: string) => void;
  helpText?: string;
}

export function DragDropVideo({ onDropVideo, helpText }: DragDropVideoProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      onDropVideo?.(file.name, url);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const colour = dragging ? "primary.main" : "primary.light";

  return (
    <Box
      borderRadius={2}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ aspectRatio: "16/9" }}
      sx={{
        border: "dashed",
        borderColor: colour,
      }}
    >
      <Typography color={colour}>
        {helpText ?? "Drag and drop a video file"}
      </Typography>
    </Box>
  );
}
