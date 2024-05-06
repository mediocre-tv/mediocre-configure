import { GrpcContextProps } from "./GrpcProvider.tsx";
import { useEffect, useState } from "react";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb.client";
import { HealthCheckResponse_ServingStatus } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb";

const defaultContext = { baseUrl: "http://localhost:50051" };

function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

export async function checkHealth(context: GrpcContextProps) {
  const transport = new GrpcWebFetchTransport({
    baseUrl: context.baseUrl,
  });
  let client = new HealthClient(transport);

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
  }, [context]);

  let newContext: GrpcContextProps | null = null;
  if (url) {
    newContext = {
      baseUrl: url,
    };
  }

  async function onSubmit() {
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

  return isValidating ? (
    <>Connecting to server...</>
  ) : (
    <>
      <form onSubmit={onSubmit}>
        <label>
          Server:
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
          />
        </label>
        <input type="submit" value="Connect" disabled={isValidating} />
      </form>
      {errorMessage}
    </>
  );
}

export default GrpcConfig;
