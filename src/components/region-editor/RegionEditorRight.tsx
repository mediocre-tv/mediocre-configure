import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import styles from "./RegionEditor.module.css";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { useEffect, useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { TransformToImage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { useGrpcClient } from "../grpc/GrpcContext.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb.client";
import { ocr } from "./Transform.ts";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const imageOrText = result && result.result !== null && (
    <Box display={"flex"} width={100} height={100} alignItems={"center"}>
      {result.result instanceof Uint8Array ? (
        <img
          src={URL.createObjectURL(new Blob([result.result]))}
          className={styles.image}
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
          <Typography
            align={"center"}
          >{`${result.elapsed.toFixed(3)}ms`}</Typography>
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
  elapsed: number;
}

interface RegionTransformationsHeaderProps {
  name: string;
  onDeleteRegion: () => void;
}

function RegionTransformationsHeader({
  name,
  onDeleteRegion,
}: RegionTransformationsHeaderProps) {
  return (
    <Stack
      direction={"row"}
      alignItems="center"
      justifyContent={"space-between"}
    >
      <Typography variant="body1" gutterBottom>
        {name}
      </Typography>
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
    <Stack direction={"row"} spacing={2}>
      <TransformationResult
        label={transformations[0].transformation.oneofKind}
        result={results[0] ?? null}
      />
      <Stack
        direction={"row"}
        spacing={2}
        overflow="auto"
        alignItems={"center"}
        justifyContent={"space-evenly"}
        width={1}
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

  const { name, transformations } = region;

  useEffect(() => {
    async function transform(
      imageData: Uint8Array,
      client: TransformServiceClient,
      transformations: TransformToImage[],
    ) {
      const transform = client.transform({
        image: {
          blob: {
            data: imageData,
          },
        },
        imageTransformations: transformations,
        otherTransformation: ocr(),
      });

      for await (const { transformed, elapsed } of transform.responses) {
        if (transformed.oneofKind === "image") {
          const data = transformed.image.blob?.data;
          if (data) {
            const result: TransformResult = { result: data, elapsed: elapsed };
            setTransformResults((results) => [...results, result]);
          }
        } else if (transformed.oneofKind === "characters") {
          const result: TransformResult = {
            result: transformed.characters,
            elapsed: elapsed,
          };
          setTransformResults((results) => [...results, result]);
        }
      }
    }

    if (imageData && transformClient) {
      setTransformResults([]);
      transform(imageData, transformClient, transformations);
    }
  }, [imageData, transformClient, transformations]);

  return (
    <Stack border={1} borderRadius={1} padding={2} spacing={1}>
      <RegionTransformationsHeader
        name={name}
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
