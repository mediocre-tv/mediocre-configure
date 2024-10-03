import { Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { ReactNode } from "react";

export interface LongOrSideBySideLayoutProps {
  leftChild: ReactNode;
  rightChild: ReactNode;
}

export function LongOrSideBySideLayout({
  leftChild,
  rightChild,
}: LongOrSideBySideLayoutProps) {
  return (
    <Box width={1} height={1} display="flex" justifyContent="center" p={10}>
      <Grid2 container width={1} spacing={10}>
        <Grid2 xs={12} lg={6}>
          {leftChild}
        </Grid2>
        <Grid2 height={1} xs={12} lg={6}>
          {rightChild}
        </Grid2>
      </Grid2>
    </Box>
  );
}
