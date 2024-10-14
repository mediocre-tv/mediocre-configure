import { Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
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
    <Box width={1} height={1} display="flex" justifyContent="center" p={5}>
      <Grid container width={1} spacing={10}>
        <Grid size={{ xs: 12, lg: 6 }}>{leftChild}</Grid>
        <Grid height={1} size={{ xs: 12, lg: 6 }}>
          {rightChild}
        </Grid>
      </Grid>
    </Box>
  );
}
