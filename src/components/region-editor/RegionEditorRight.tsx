import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import styles from "./RegionEditor.module.css";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { useGrpcClient } from "../grpc/GrpcContext.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb.client";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Dimensions } from "../shapes/Dimensions.ts";
import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { transform, TransformResult } from "./Transform.ts";

interface TransformationResultProps {
  label: string;
  result: TransformResult | null;
}

function TransformationResult({ label, result }: TransformationResultProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<Dimensions | null>(
    null,
  );

  const timeTaken =
    result?.elapsed !== null && result?.elapsed !== undefined
      ? result.elapsed.toFixed(3)
      : "unknown ";

  const footerText = imageDimensions
    ? `${imageDimensions.width} x ${imageDimensions.height}`
    : "Text";

  const imageOrText = result && result.result !== null && (
    <Box display={"flex"} width={100} height={100} alignItems={"center"}>
      {result.result instanceof Uint8Array ? (
        <img
          ref={imgRef}
          src={URL.createObjectURL(new Blob([result.result]))}
          className={styles.image}
          onLoad={() => {
            if (imgRef.current) {
              const newDimensions = {
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight,
              };
              if (
                imageDimensions?.width !== newDimensions.width &&
                imageDimensions?.height !== newDimensions.height
              ) {
                setImageDimensions(newDimensions);
              }
            }
          }}
        />
      ) : (
        <Typography
          maxHeight={1}
          width={1}
          overflow={"auto"}
          component="div"
          align={"center"}
        >
          {result.result !== "" ? (
            result.result
          ) : (
            <Box sx={{ fontStyle: "italic" }}>Empty</Box>
          )}
        </Typography>
      )}
    </Box>
  );

  return (
    <Stack spacing={1}>
      <Typography align={"center"}>{label}</Typography>
      {result && result.result !== null ? (
        <>
          {imageOrText}
          <Typography align={"center"}>{footerText}</Typography>
          <Typography align={"center"}>{timeTaken}ms</Typography>
        </>
      ) : (
        <>
          <Skeleton width={100} height={100}></Skeleton>
          <Typography align={"center"}>Loading</Typography>
        </>
      )}
    </Stack>
  );
}

interface EditableTransformationResultProps {
  transformation: Transform;
  setTransformation: (transformation: Transform) => void;
  result: TransformResult | null;
  previousResult: TransformResult | null;
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
        <TransformationResult label={label ?? "Unknown"} result={result} />
      </IconButton>
      <EditTransformationDialog
        transformation={transformation}
        setTransformation={setTransformation}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        previousResult={previousResult}
      />
    </>
  );
}

interface RegionTransformationsHeaderNameProps {
  name: string;
  setName: (name: string) => void;
}

function RegionTransformationsHeaderName({
  name,
  setName,
}: RegionTransformationsHeaderNameProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);

  if (isRenaming) {
    return (
      <form
        onSubmit={() => {
          setIsRenaming(false);
          setName(newName);
        }}
      >
        <Stack direction={"row"}>
          <TextField
            value={newName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewName(event.target.value);
            }}
            autoFocus={true}
          />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    );
  }

  return (
    <Stack direction={"row"} alignItems={"center"} gap={1}>
      <Typography variant="body1">{name}</Typography>
      <IconButton onClick={() => setIsRenaming(true)}>
        <EditIcon />
      </IconButton>
    </Stack>
  );
}

interface RegionTransformationsHeaderProps {
  name: string;
  onRenameRegion: (name: string) => void;
  onDeleteRegion: () => void;
}

function RegionTransformationsHeader({
  name,
  onRenameRegion,
  onDeleteRegion,
}: RegionTransformationsHeaderProps) {
  return (
    <Stack
      direction={"row"}
      alignItems="center"
      justifyContent={"space-between"}
    >
      <RegionTransformationsHeaderName name={name} setName={onRenameRegion} />
      <Stack direction={"row"}>
        <IconButton onClick={onDeleteRegion}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

interface RegionTransformationsBodyProps {
  imageData: Uint8Array | null;
  transformations: Transform[];
  setTransformations: (transformations: Transform[]) => void;
  results: TransformResult[];
}

function RegionTransformationsBody({
  imageData,
  transformations,
  setTransformations,
  results,
}: RegionTransformationsBodyProps) {
  const addTransformation = (transformation: Transform, index: number) => {
    const splicedTransformations = transformations;
    splicedTransformations.splice(index + 1, 0, transformation);
    setTransformations([...splicedTransformations]);
  };
  const setTransformation = (transformation: Transform, index: number) => {
    const splicedTransformations = transformations;
    splicedTransformations.splice(index, 1, transformation);
    setTransformations([...splicedTransformations]);
  };

  return (
    <Stack
      direction={"row"}
      spacing={2}
      justifyContent={"space-between"}
      alignItems={"center"}
      overflow="auto"
    >
      {transformations.map((transformation, index) => {
        const result = results[index];
        const previousResult =
          index == 0 ? { result: imageData, elapsed: 0 } : results[index - 1];

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
            {index < transformations.length - 1 && (
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

interface RegionTransformationsProps {
  region: Region;
  onUpdateRegion: (region: Region) => void;
  onDeleteRegion: () => void;
  imageData: Uint8Array | null;
}

function RegionTransformations({
  region,
  onUpdateRegion,
  onDeleteRegion,
  imageData,
}: RegionTransformationsProps) {
  const transformClient = useGrpcClient(TransformServiceClient);
  const [transformResults, setTransformResults] = useState<TransformResult[]>(
    [],
  );
  const setTransformations = (transformations: Transform[]) =>
    onUpdateRegion({ ...region, transformations });
  const setName = (name: string) => onUpdateRegion({ ...region, name });

  const { name, transformations } = region;

  useEffect(() => {
    const abortController = new AbortController();

    if (imageData && transformClient) {
      transform(
        imageData,
        transformClient,
        transformations,
        abortController,
      ).then(setTransformResults);
    }

    return () => {
      abortController.abort();
    };
  }, [imageData, transformClient, transformations]);

  return (
    <Stack border={1} borderRadius={1} padding={2} spacing={1}>
      <RegionTransformationsHeader
        name={name}
        onRenameRegion={setName}
        onDeleteRegion={onDeleteRegion}
      />
      <Divider />
      <RegionTransformationsBody
        imageData={imageData}
        transformations={transformations}
        setTransformations={setTransformations}
        results={transformResults}
      />
    </Stack>
  );
}

interface AddTransformationButtonProps {
  addTransformation: (transformation: Transform) => void;
  previousResult: TransformResult | null;
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
        <AddCircleOutlineOutlinedIcon />
      </IconButton>
      <EditTransformationDialog
        transformation={Transform.create()}
        setTransformation={addTransformation}
        isOpen={isOpen}
        onClose={close}
        previousResult={previousResult}
      />
    </Box>
  );
}

interface EditTransformationDialogProps {
  isOpen: boolean;
  transformation: Transform;
  setTransformation: (transformation: Transform) => void;
  onClose: () => void;
  previousResult: TransformResult | null;
}

function EditTransformationDialog({
  isOpen,
  transformation,
  setTransformation,
  onClose,
  previousResult,
}: EditTransformationDialogProps) {
  const transformClient = useGrpcClient(TransformServiceClient);
  const [transformResult, setTransformResult] =
    useState<TransformResult | null>(null);

  const onPreview = async (transformation: Transform) => {
    if (
      !transformClient ||
      !previousResult?.result ||
      !(previousResult.result instanceof Uint8Array)
    ) {
      return;
    }

    setTransformResult(null);

    const result = await transform(
      previousResult.result,
      transformClient,
      [transformation],
      new AbortController(),
    );

    setTransformResult(result[0]);
  };

  return (
    <Dialog onClose={onClose} open={isOpen} fullWidth maxWidth="sm">
      <DialogTitle>Add a transformation</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction={"row"} justifyContent={"space-evenly"}>
            <TransformationResult label="Before" result={previousResult} />
            <TransformationResult label="After" result={transformResult} />
          </Stack>
          <ProtobufEditor
            message={Transform.create(transformation)}
            setMessage={(transformation) => {
              setTransformation(transformation);
              onClose();
            }}
            onCancel={onClose}
            onPreview={onPreview}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

interface RegionEditorRightParams {
  image: string;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
}

export function RegionEditorRight({
  image,
  regions,
  setRegions,
}: RegionEditorRightParams) {
  const [imageData, setImageData] = useState<Uint8Array | null>(null);
  useEffect(() => {
    fetch(image)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer))
      .then(setImageData);
  }, [image]);

  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Stack
      height={1}
      spacing={5}
      textAlign={"center"}
      sx={{
        ...(hasLgBreakpoint && {
          overflow: "auto",
        }),
      }}
    >
      {regions.map((region, index, regions) => (
        <RegionTransformations
          key={region.id}
          region={region}
          onUpdateRegion={(region) => {
            const updatedRegions = regions;
            updatedRegions[index] = region;
            setRegions([...updatedRegions]);
          }}
          onDeleteRegion={() => {
            const updatedRegions = regions;
            updatedRegions.splice(index, 1);
            setRegions([...updatedRegions]);
          }}
          imageData={imageData}
        />
      ))}
    </Stack>
  );
}
