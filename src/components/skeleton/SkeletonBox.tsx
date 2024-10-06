import { Box, Skeleton } from "@mui/material";
import { PropsWithChildren } from "react";
import { BoxProps } from "@mui/material/Box";

export interface SkeletonBoxProps extends PropsWithChildren {
  showSkeleton: boolean;
  width?: number;
  height?: number;
  aspectRatio?: string;
  boxProps?: BoxProps;
}

export function SkeletonBox({
  children,
  showSkeleton,
  width,
  height,
  aspectRatio,
  boxProps,
}: SkeletonBoxProps) {
  return (
    <Box
      width={width ?? 1}
      height={height ?? 1}
      sx={{ aspectRatio: aspectRatio }}
      {...boxProps}
    >
      {showSkeleton ? (
        <Skeleton sx={{ width: "100%", height: "100%" }} variant="rounded" />
      ) : (
        children
      )}
    </Box>
  );
}
