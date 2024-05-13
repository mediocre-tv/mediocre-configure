import { FormEvent, useEffect, useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb.client";
import { HealthCheckResponse_ServingStatus } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb";
import { Alert, Stack, TextField } from "@mui/material";
import ProgressButton from "../progress-button/ProgressButton.tsx";
import { GrpcContextProps } from "./GrpcContext.tsx";

const locationProtocol = location.protocol;
const defaultContextPort =
  locationProtocol === "https:"
    ? import.meta.env.VITE_CLIENT_HTTPS_PORT
    : import.meta.env.VITE_CLIENT_HTTP_PORT;
const defaultContextDomain = import.meta.env.VITE_CLIENT_DOMAIN;
const defaultContext = {
  baseUrl: `${locationProtocol}//${defaultContextDomain}:${defaultContextPort}`,
};

function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

async function checkHealth(context: GrpcContextProps) {
  const transport = new GrpcWebFetchTransport({
    baseUrl: context.baseUrl,
  });
  const client = new HealthClient(transport);

  try {
    const { response } = await client.check({ service: "" });
    if (response.status === HealthCheckResponse_ServingStatus.SERVING) {
      return {
        isValid: true,
        errorMessage: null,
      };
    } else {
      return {
        isValid: false,
        errorMessage: `GRPC Service Status: ${response.status}`,
      };
    }
  } catch (error) {
    let errorMessage;
    if (isErrorWithMessage(error)) {
      errorMessage = `${error.name}: ${error.message}`;
    } else {
      errorMessage = "Unknown error";
    }
    return {
      isValid: false,
      errorMessage: errorMessage,
    };
  }
}

interface GrpcConfigProps {
  context: GrpcContextProps | null;
  setContext: (context: GrpcContextProps) => void;
}

function GrpcConfig({ context, setContext }: GrpcConfigProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isValidating = isValid === null;

  const [url, setUrl] = useState(context?.baseUrl ?? "");

  useEffect(() => {
    if (!context) {
      tryDefaultUrl();
    }

    async function tryDefaultUrl() {
      const result = await checkHealth(defaultContext);
      if (result.isValid) {
        setIsValid(true);
        setContext(defaultContext);
      } else {
        setIsValid(false);
        setErrorMessage(
          "Could not connect to default server. Please enter details of a valid server.",
        );
      }
    }
  }, [context, setContext]);

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
    <Stack spacing={2}>
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
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}

export default GrpcConfig;
