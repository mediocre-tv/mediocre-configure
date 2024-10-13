import { Alert, Stack, Typography } from "@mui/material";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import { TransformResultOrError } from "../providers/transform-results/TransformResultsContext.ts";

interface TransformResultViewerProps {
  timestamp: number;
  results: TransformResultOrError[];
  onClick?: () => void;
}

export function TransformResultViewer({
  timestamp,
  results,
  onClick,
}: TransformResultViewerProps) {
  const result =
    results.find((result) => "error" in result) ??
    results.at(results.length - 1);

  const prettyTime = new Date(timestamp * 1000).toISOString().slice(14, 19);

  return (
    <Stack
      margin={1}
      border={1}
      borderRadius={1}
      width={200}
      onClick={onClick}
      sx={{ cursor: "pointer" }}
    >
      <SkeletonBox
        showSkeleton={!result}
        aspectRatio={"16/9"}
        boxProps={{ padding: 1 }}
      >
        {result &&
          ("error" in result ? (
            <Alert severity={"error"}>{result.error}</Alert>
          ) : "image" in result ? (
            <img
              src={result.image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          ) : (
            <Typography>{result.text}</Typography>
          ))}
      </SkeletonBox>
      <Typography textAlign={"center"} paddingBottom={1}>
        {prettyTime}
      </Typography>
    </Stack>
  );
}