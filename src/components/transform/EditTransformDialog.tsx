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
      transformClient &&
      previousResult?.result &&
      previousResult.result instanceof Uint8Array
    ) {
      setTransformResult(null);
      const result = await transformSingle(
        previousResult.result,
        transformClient,
        transformation,
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
