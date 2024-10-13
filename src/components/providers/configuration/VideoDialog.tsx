import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { DragDropVideo } from "../../video/DragDropVideo.tsx";
import { Video } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/test_pb";

interface VideoDialogProps {
  open: boolean;
  error: string | null;
  video: Video | undefined;
  onSelectVideo: (name: string, video: string) => void;
}

export default function VideoDialog({
  open,
  error,
  video,
  onSelectVideo,
}: VideoDialogProps) {
  return (
    <Dialog
      open={open}
      fullWidth={true}
      PaperProps={{
        component: "form",
      }}
    >
      <DialogTitle>Select a video</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DragDropVideo onDropVideo={onSelectVideo} helpText={video?.name} />
          {error && <Alert severity={"error"}>{error}</Alert>}
          {error && video?.url.startsWith("blob:") && (
            <Alert severity={"info"}>
              Local videos cannot be loaded without being re-dropped.
            </Alert>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
