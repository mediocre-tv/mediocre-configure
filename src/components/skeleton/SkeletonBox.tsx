import { Box, Skeleton } from "@mui/material";
import { PropsWithChildren } from "react";

export interface SkeletonBoxProps extends PropsWithChildren {
  showSkeleton: boolean;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export function SkeletonBox({
  children,
  showSkeleton,
  width,
  height,
  aspectRatio,
}: SkeletonBoxProps) {
  return (
    <Box
      width={width ?? 1}
      height={height ?? 1}
      sx={{ aspectRatio: aspectRatio }}
    >
      {showSkeleton ? (
        <Skeleton sx={{ width: "100%", height: "100%" }} variant="rounded" />
      ) : (
        children
      )}
    </Box>
  );
}
