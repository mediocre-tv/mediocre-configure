import { FormEvent, useState } from "react";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { checkHealth } from "./GrpcHealth.ts";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import { GrpcTransportParts } from "./GrpcProviderWithDialog.tsx";

interface GrpcConfigDialogProps {
  open: boolean;
  parts: GrpcTransportParts | null;
  setParts: (parts: GrpcTransportParts) => void;
}

export default function GrpcConfigDialog({
  open,
  parts,
  setParts,
}: GrpcConfigDialogProps) {
  const [isValid, setIsValid] = useState<boolean | null>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isValidating = isValid === null;

  const [domain, setDomain] = useState(parts?.domain ?? "");
  const [port, setPort] = useState(parts?.port ?? "");
  const newParts: GrpcTransportParts = {
    domain: domain,
    port: port,
  };
  const hasRequiredDetails = !!domain && !!port;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    setIsValid(null);
    const result = await checkHealth(newParts);

    setIsValid(result.isValid);
    setErrorMessage(result.errorMessage);

    if (result.isValid) {
      setParts(newParts);
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      PaperProps={{
        component: "form",
      }}
    >
      <DialogTitle>Connect to mediocre</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <DialogContentText>
              Could not connect to the default server, please enter the details
              of a valid server:
            </DialogContentText>
          </Grid>
          <Grid container>
            <Grid size={{ xs: 8 }}>
              <TextField
                required
                label="Domain"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                }}
                disabled={isValidating}
                margin="normal"
                type="url"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                required
                label="Port"
                value={port}
                onChange={(e) => {
                  setPort(e.target.value);
                }}
                disabled={isValidating}
                margin="normal"
                type="number"
                fullWidth
              />
            </Grid>
          </Grid>
          {errorMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={onSubmit}
          loading={isValidating}
          disabled={!hasRequiredDetails}
          type="submit"
        >
          Connect
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
