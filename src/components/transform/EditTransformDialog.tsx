import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { TransformResultOrError } from "../providers/transform-results/TransformResults.ts";
import { Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useGrpcClient } from "../providers/grpc/GrpcContext.ts";
import { useState } from "react";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { TransformResultViewer } from "./TransformResultViewer.tsx";
import { transformSingle } from "./Transform.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";

interface EditTransformDialogProps {
  isOpen: boolean;
  transformation: Transform;
  setTransformation: (transformation: Transform) => void;
  onClose: () => void;
  previousResult: TransformResultOrError | null;
}

export function EditTransformDialog({
  isOpen,
  transformation,
  setTransformation,
  onClose,
  previousResult,
}: EditTransformDialogProps) {
  const transformClient = useGrpcClient(TransformServiceClient);
  const [transformResult, setTransformResult] =
    useState<TransformResultOrError | null>(null);

  const onPreview = async (transformation: Transform) => {
    if (transformClient && previousResult && "image" in previousResult) {
      setTransformResult(null);
      const result = await transformSingle(
        previousResult.image,
        transformation,
        transformClient,
      );
      setTransformResult(result);
    }
  };

  return (
    <Dialog onClose={onClose} open={isOpen} fullWidth maxWidth="sm">
      <DialogTitle>Add a transformation</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction={"row"} justifyContent={"space-evenly"}>
            <TransformResultViewer label="Before" result={previousResult} />
            <TransformResultViewer label="After" result={transformResult} />
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
