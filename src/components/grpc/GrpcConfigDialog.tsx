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
import { GrpcContextProps } from "./GrpcContext.ts";
import { checkHealth } from "./GrpcHealth.ts";
import Grid2 from "@mui/material/Unstable_Grid2";
import LoadingButton from "@mui/lab/LoadingButton";

interface GrpcConfigDialogProps {
  open: boolean;
  context: GrpcContextProps | null;
  setContext: (context: GrpcContextProps) => void;
}

export default function GrpcConfigDialog({
  open,
  context,
  setContext,
}: GrpcConfigDialogProps) {
  const [isValid, setIsValid] = useState<boolean | null>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isValidating = isValid === null;

  const [domain, setDomain] = useState(context?.domain ?? "");
  const [port, setPort] = useState(context?.port ?? "");
  const newContext: GrpcContextProps = {
    domain: domain,
    port: port,
  };
  const hasRequiredDetails = !!domain && !!port;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    setIsValid(null);
    const result = await checkHealth(newContext);

    setIsValid(result.isValid);
    setErrorMessage(result.errorMessage);

    if (result.isValid) {
      setContext(newContext);
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
        <Grid2 container spacing={1}>
          <Grid2 xs={12}>
            <DialogContentText>
              Could not connect to the default server, please enter the details
              of a valid server:
            </DialogContentText>
          </Grid2>
          <Grid2 container>
            <Grid2 xs={8}>
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
            </Grid2>
            <Grid2 xs={4}>
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
            </Grid2>
          </Grid2>
          {errorMessage && (
            <Grid2 xs={12}>
              <Alert severity="error">{errorMessage}</Alert>
            </Grid2>
          )}
        </Grid2>
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
