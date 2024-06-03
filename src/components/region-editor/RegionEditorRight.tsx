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
import { Region } from "../../../../mediocre-service/@buf/typescript/mediocre/configuration/v1beta/configuration_pb";
import { Fragment, useEffect, useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { TransformToImage } from "../../../../mediocre-service/@buf/typescript/mediocre/image/transform/v1beta/transform_pb";
import { useGrpcClient } from "../grpc/GrpcContext.ts";
import { TransformServiceClient } from "../../../../mediocre-service/@buf/typescript/mediocre/image/transform/v1beta/transform_pb.client";
import { ocr } from "./Transform.ts";
import DeleteIcon from "@mui/icons-material/Delete";

interface TransformationResultProps {
  transformation?: string;
  result: TransformResult | null;
}

function TransformationResult({
  transformation,
  result,
}: TransformationResultProps) {
  return (
    <Stack spacing={1}>
      <Typography>{transformation}</Typography>
      {result?.result ? (
        <>
          <Box display={"flex"} width={100} height={100} alignItems={"center"}>
            {result.result instanceof Uint8Array ? (
              <img
                src={URL.createObjectURL(new Blob([result.result]))}
                className={styles.image}
              />
            ) : (
              <Typography maxHeight={1} width={1} overflow={"auto"}>
                {result.result}
              </Typography>
            )}
          </Box>
          <Typography>{`${result.elapsed.toFixed(3)}ms`}</Typography>
        </>
      ) : (
        <>
          <Skeleton width={100} height={100}></Skeleton>
          <Typography>Loading</Typography>
        </>
      )}
    </Stack>
  );
}

interface TransformResult {
  result: Uint8Array | string | null;
  elapsed: number;
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
      <Divider />
      <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
        <TransformationResult
          transformation={transformations[0].transformation.oneofKind}
          result={transformResults.at(0) ?? null}
        />
        <Stack
          direction={"row"}
          spacing={2}
          overflow="auto"
          alignItems={"center"}
        >
          <AddTransformationButton
            setTransformation={(transformation) =>
              setTransformations([transformation, ...transformations])
            }
          />
          {transformations.slice(1).map((transformation, index) => (
            <Fragment key={index}>
              <TransformationResult
                transformation={transformation.transformation.oneofKind}
                result={transformResults.at(index + 1) ?? null}
              />
              <AddTransformationButton
                setTransformation={(transformation) => {
                  const splicedTransformations = transformations;
                  splicedTransformations.splice(index + 1, 0, transformation);
                  setTransformations([...splicedTransformations]);
                }}
              />
            </Fragment>
          ))}
        </Stack>
        <TransformationResult
          transformation="OCR"
          result={transformResults.at(-1) ?? null}
        />
      </Stack>
    </Stack>
  );
}

interface AddTransformationButtonProps {
  setTransformation: (transformation: TransformToImage) => void;
}

function AddTransformationButton({
  setTransformation,
}: AddTransformationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <Box>
      <IconButton size="small" onClick={open}>
        <AddCircleOutlineOutlinedIcon />
      </IconButton>
      <Dialog onClose={close} open={isOpen} fullWidth maxWidth="sm">
        <DialogTitle>Add a transformation</DialogTitle>
        <DialogContent>
          <ProtobufEditor
            message={TransformToImage.create()}
            setMessage={(transformation) => {
              setTransformation(transformation);
              close();
            }}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
    </Box>
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
