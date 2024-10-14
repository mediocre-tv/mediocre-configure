import { Alert, Box, IconButton, Stack, Typography } from "@mui/material";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Fragment, useState } from "react";
import { TransformResultOrError } from "../providers/transform-results/TransformResults.ts";
import { EditTransformDialog } from "./EditTransformDialog.tsx";
import { AddCircleOutlined } from "@mui/icons-material";

interface TransformResultProps {
  result: TransformResultOrError | null;
}

export function TransformResult({ result }: TransformResultProps) {
  return (
    <SkeletonBox
      showSkeleton={!result}
      width={200}
      height={200}
      boxProps={{
        padding: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {result &&
        ("error" in result ? (
          <Alert
            sx={{ height: "100%", width: "100%" }}
            severity={"error"}
            icon={false}
          >
            {result.error}
          </Alert>
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
  );
}

interface TransformResultViewerProps {
  result: TransformResultOrError | null;
  label?: string;
  onClick?: () => void;
}

export function TransformResultViewer({
  result,
  label,
  onClick,
}: TransformResultViewerProps) {
  return (
    <Stack
      margin={1}
      width={200}
      onClick={onClick}
      sx={{ ...(onClick && { cursor: "pointer" }) }}
    >
      <TransformResult result={result} />
      {label && (
        <Typography textAlign={"center"} paddingBottom={1}>
          {label}
        </Typography>
      )}
    </Stack>
  );
}

interface TransformResultsViewerProps {
  image: string;
  transforms: Transform[];
  setTransforms: (transformations: Transform[]) => void;
  results: TransformResultOrError[];
}

export function TransformResultsViewer({
  image,
  results,
  transforms,
  setTransforms,
}: TransformResultsViewerProps) {
  const addTransformation = (transformation: Transform, index: number) =>
    setTransforms(transforms.toSpliced(index + 1, 0, transformation));

  const setTransformation = (transformation: Transform, index: number) =>
    setTransforms(transforms.toSpliced(index, 1, transformation));

  return (
    <Stack
      direction={"row"}
      spacing={2}
      justifyContent={"space-between"}
      alignItems={"center"}
      overflow="auto"
    >
      {transforms.map((transformation, index) => {
        const result = results[index];
        const previousResult =
          index == 0 ? { image: image, elapsed: 0 } : results[index - 1];

        return (
          <Fragment key={index}>
            <EditableTransformationResult
              transformation={transformation}
              result={result}
              previousResult={previousResult}
              setTransformation={(transformation) =>
                setTransformation(transformation, index)
              }
            />
            {index < transforms.length - 1 && (
              <AddTransformationButton
                addTransformation={(transformation) =>
                  addTransformation(transformation, index)
                }
                previousResult={result}
              />
            )}
          </Fragment>
        );
      })}
    </Stack>
  );
}

interface EditableTransformationResultProps {
  transformation: Transform;
  setTransformation: (transformation: Transform) => void;
  result: TransformResultOrError | null;
  previousResult: TransformResultOrError | null;
}

function EditableTransformationResult({
  transformation,
  setTransformation,
  result,
  previousResult,
}: EditableTransformationResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  let label: string | undefined;
  if (transformation.transformation.oneofKind === "imageToImage") {
    label = transformation.transformation.imageToImage.transformation.oneofKind;
  } else if (transformation.transformation.oneofKind === "imageToText") {
    label = transformation.transformation.imageToText.transformation.oneofKind;
  }

  return (
    <>
      <IconButton onClick={() => setIsEditing(true)} sx={{ borderRadius: 2 }}>
        <TransformResultViewer label={label ?? "Unknown"} result={result} />
      </IconButton>
      <EditTransformDialog
        transformation={transformation}
        setTransformation={setTransformation}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        previousResult={previousResult}
      />
    </>
  );
}

interface AddTransformationButtonProps {
  addTransformation: (transformation: Transform) => void;
  previousResult: TransformResultOrError | null;
}

function AddTransformationButton({
  addTransformation,
  previousResult,
}: AddTransformationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <Box>
      <IconButton size="small" onClick={open}>
        <AddCircleOutlined />
      </IconButton>
      <EditTransformDialog
        transformation={Transform.create()}
        setTransformation={addTransformation}
        isOpen={isOpen}
        onClose={close}
        previousResult={previousResult}
      />
    </Box>
  );
}
