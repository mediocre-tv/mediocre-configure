import { FormEvent, useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import ProgressButton from "../progress-button/ProgressButton.tsx";
import { GrpcContextProps } from "./GrpcContext.tsx";
import { checkHealth } from "./GrpcHealth.ts";

interface GrpcConfigProps {
  context: GrpcContextProps | null;
  setContext: (context: GrpcContextProps) => void;
}

export default function GrpcConfig({ context, setContext }: GrpcConfigProps) {
  const [isValid, setIsValid] = useState<boolean | null>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    "Could not connect to default server. Please enter details of a valid server.",
  );
  const isValidating = isValid === null;

  const [url, setUrl] = useState(context?.baseUrl ?? "");

  let newContext: GrpcContextProps | null = null;
  if (url) {
    newContext = {
      baseUrl: url,
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!newContext) {
      return;
    }

    setIsValid(null);
    const result = await checkHealth(newContext);

    setIsValid(result.isValid);
    setErrorMessage(result.errorMessage);

    if (result.isValid) {
      setContext(newContext);
    }
  }

  return (
    <Stack
      spacing={2}
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <form onSubmit={onSubmit}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <TextField
            label="Server"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            disabled={isValidating}
          />
          <ProgressButton
            type="submit"
            text="Connect"
            inProgress={isValidating}
          />
        </Stack>
      </form>
      <Alert severity="error">{errorMessage}</Alert>
    </Stack>
  );
}
