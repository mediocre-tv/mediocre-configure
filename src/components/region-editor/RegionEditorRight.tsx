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
import { ChangeEvent, useEffect, useRef, useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { TransformToImage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { useGrpcClient } from "../grpc/GrpcContext.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb.client";
import { ocr } from "./Transform.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Dimensions } from "../shapes/Dimensions.ts";
import { isRpcError } from "../grpc/GrpcHealth.ts";

interface TransformationResultProps {
  label?: string;
  result: TransformResult | null;
  onClick?: () => void;
}

function TransformationResult({
  label,
  result,
  onClick,
}: TransformationResultProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<Dimensions | null>(
    null,
  );

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
        <Typography maxHeight={1} width={1} overflow={"auto"} component="div">
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
          {onClick ? (
            <IconButton onClick={onClick} sx={{ borderRadius: 2 }}>
              {imageOrText}
            </IconButton>
          ) : (
            imageOrText
          )}
          <Typography align={"center"}>{footerText}</Typography>
          <Typography
            align={"center"}
          >{`${result.elapsed ? result.elapsed.toFixed(3) : "unknown "}ms`}</Typography>
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

interface TransformResult {
  result: Uint8Array | string | null;
  elapsed: number | null;
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

  const nameAndButton = (
    <Stack direction={"row"} alignItems={"center"} gap={1}>
      {name}
      <IconButton onClick={() => setIsRenaming(true)}>
        <EditIcon />
      </IconButton>
    </Stack>
  );

  const renameForm = (
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

  return (
    <Typography variant="body1" gutterBottom>
      {isRenaming ? renameForm : nameAndButton}
    </Typography>
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
  transformations: TransformToImage[];
  setTransformations: (transformations: TransformToImage[]) => void;
  results: TransformResult[];
}

function RegionTransformationsBody({
  transformations,
  setTransformations,
  results,
}: RegionTransformationsBodyProps) {
  const addTransformation = (
    transformation: TransformToImage,
    index: number,
  ) => {
    const splicedTransformations = transformations;
    splicedTransformations.splice(index + 1, 0, transformation);
    setTransformations([...splicedTransformations]);
  };
  const setTransformation = (
    transformation: TransformToImage,
    index: number,
  ) => {
    const splicedTransformations = transformations;
    splicedTransformations.splice(index, 1, transformation);
    setTransformations([...splicedTransformations]);
  };

  return (
    <Stack direction={"row"} spacing={2} justifyContent={"space-between"}>
      <TransformationResult
        label={transformations[0].transformation.oneofKind}
        result={results[0] ?? null}
      />
      <Stack
        direction={"row"}
        spacing={2}
        overflow="auto"
        alignItems={"center"}
      >
        <AddTransformationButton
          addTransformation={(transformation) =>
            addTransformation(transformation, 0)
          }
          previousResult={results[0] ?? null}
        />
        {transformations.slice(1).map((transformation, index) => {
          const actualIndex = index + 1; // we skipped the first transformation
          return (
            <RegionIntermediateTransformations
              key={actualIndex}
              result={results[actualIndex] ?? null}
              previousResult={results[index] ?? null}
              transformation={transformation}
              setTransformation={(transformation) =>
                setTransformation(transformation, actualIndex)
              }
              addTransformation={(transformation) =>
                addTransformation(transformation, actualIndex)
              }
            />
          );
        })}
      </Stack>
      <TransformationResult
        label="OCR"
        result={results[transformations.length] ?? null}
      />
    </Stack>
  );
}

interface RegionIntermediateTransformationsProps {
  result: TransformResult | null;
  previousResult: TransformResult | null;
  transformation: TransformToImage;
  setTransformation: (transformation: TransformToImage) => void;
  addTransformation: (transformation: TransformToImage) => void;
}

function RegionIntermediateTransformations({
  result,
  previousResult,
  transformation,
  setTransformation,
  addTransformation,
}: RegionIntermediateTransformationsProps) {
  const [editIsOpen, setEditIsOpen] = useState(false);

  return (
    <>
      <TransformationResult
        label={transformation.transformation.oneofKind}
        result={result}
        onClick={() => setEditIsOpen(true)}
      />
      <EditTransformationDialog
        transformation={transformation}
        setTransformation={setTransformation}
        isOpen={editIsOpen}
        onClose={() => setEditIsOpen(false)}
        previousResult={previousResult}
      />
      <AddTransformationButton
        addTransformation={addTransformation}
        previousResult={result}
      />
    </>
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
  const setTransformations = (transformations: TransformToImage[]) =>
    onUpdateRegion({ ...region, transformations });
  const setName = (name: string) => onUpdateRegion({ ...region, name });

  const { name, transformations } = region;

  useEffect(() => {
    const abortController = new AbortController();

    async function transform(
      imageData: Uint8Array,
      client: TransformServiceClient,
      transformations: TransformToImage[],
    ) {
      const transform = client.transform(
        {
          image: {
            blob: {
              data: imageData,
            },
          },
          imageTransformations: transformations,
          otherTransformation: ocr(),
        },
        { abort: abortController.signal },
      );

      const results: TransformResult[] = [];

      try {
        for await (const { transformed, elapsed } of transform.responses) {
          if (transformed.oneofKind === "image") {
            const data = transformed.image.blob?.data;
            if (data) {
              results.push({ result: data, elapsed: elapsed });
            }
          } else if (transformed.oneofKind === "characters") {
            results.push({
              result: transformed.characters,
              elapsed: elapsed,
            });
          }
        }
      } catch (error) {
        let errorMessage;
        if (isRpcError(error)) {
          errorMessage = error.message || error.code;
        } else {
          errorMessage = "Unknown error";
        }
        results.push({ result: errorMessage, elapsed: null });
      }

      setTransformResults(results);
    }

    if (imageData && transformClient) {
      transform(imageData, transformClient, transformations);
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
        transformations={transformations}
        setTransformations={setTransformations}
        results={transformResults}
      />
    </Stack>
  );
}

interface AddTransformationButtonProps {
  addTransformation: (transformation: TransformToImage) => void;
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
        transformation={TransformToImage.create()}
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
  transformation: TransformToImage;
  setTransformation: (transformation: TransformToImage) => void;
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

  const onPreview = async (transformation: TransformToImage) => {
    if (
      !transformClient ||
      !previousResult?.result ||
      !(previousResult.result instanceof Uint8Array)
    ) {
      return;
    }

    setTransformResult(null);

    const transform = transformClient.transform({
      image: {
        blob: {
          data: previousResult.result,
        },
      },
      imageTransformations: [transformation],
    });

    for await (const { transformed, elapsed } of transform.responses) {
      if (transformed.oneofKind === "image") {
        const data = transformed.image.blob?.data;
        if (data) {
          const result: TransformResult = { result: data, elapsed: elapsed };
          setTransformResult(result);
        }
      } else if (transformed.oneofKind === "characters") {
        const result: TransformResult = {
          result: transformed.characters,
          elapsed: elapsed,
        };
        setTransformResult(result);
      }
    }
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
            message={TransformToImage.create(transformation)}
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
