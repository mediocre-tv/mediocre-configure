import { Box } from "@mui/material";
import { PropsWithChildren } from "react";

export interface FallbackImageBoxProps extends PropsWithChildren {
  shouldFallback: boolean;
  fallbackImage: string | null;
  onImageRefChange?: (ref: HTMLImageElement) => void;
}

export function FallbackImageBox({
  children,
  shouldFallback,
  fallbackImage,
  onImageRefChange,
}: FallbackImageBoxProps) {
  return (
    <Box width={1} sx={{ aspectRatio: "16/9" }}>
      {fallbackImage && (
        <Box sx={{ display: shouldFallback ? "block" : "none" }}>
          <img
            ref={onImageRefChange}
            src={fallbackImage}
            width="100%"
            height="100%"
          />
        </Box>
      )}
      <Box sx={{ display: !shouldFallback ? "block" : "none" }}>{children}</Box>
    </Box>
  );
}
