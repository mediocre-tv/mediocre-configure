import { useEffect, useState } from "react";
import { checkHealth } from "./GrpcHealth.ts";
import { GrpcTransportParts } from "./GrpcProviderWithDialog.tsx";

export default function useValidateGrpcTransport(parts: GrpcTransportParts) {
  const [valid, setValid] = useState<boolean | null>(null);
  const validating = valid === null;

  useEffect(() => {
    if (validating) {
      validate(parts);
    }

    async function validate(parts: GrpcTransportParts) {
      const { isValid } = await checkHealth(parts);
      setValid(isValid);
    }
  }, [parts, validating]);

  return { validating, valid };
}
