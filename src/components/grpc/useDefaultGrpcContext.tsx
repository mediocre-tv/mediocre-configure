import { GrpcContextProps } from "./GrpcContext.tsx";
import { useEffect, useState } from "react";
import { checkHealth } from "./GrpcHealth.ts";

const locationProtocol = location.protocol;
const defaultContextPort =
  locationProtocol === "https:"
    ? import.meta.env.VITE_CLIENT_HTTPS_PORT
    : import.meta.env.VITE_CLIENT_HTTP_PORT;
const defaultContextDomain = import.meta.env.VITE_CLIENT_DOMAIN;
const defaultContext = {
  baseUrl: `${locationProtocol}//${defaultContextDomain}:${defaultContextPort}`,
};

export default function useDefaultGrpcContext(): [
  boolean,
  GrpcContextProps | null,
] {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<GrpcContextProps | null>(null);

  useEffect(() => {
    if (loading) {
      tryDefaultUrl();
    }

    async function tryDefaultUrl() {
      const result = await checkHealth(defaultContext);
      if (result.isValid) {
        setContext(defaultContext);
      }
      setLoading(false);
    }
  }, [loading]);

  return [loading, context];
}
