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
  const widthOr1 = width ?? (!height && !aspectRatio ? 1 : undefined);
  const heightOr1 = height ?? (!width && !aspectRatio ? 1 : undefined);

  return (
    <Box
      width={widthOr1}
      height={heightOr1}
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
