import { GrpcContextProps } from "./GrpcContext.ts";
import { useEffect, useState } from "react";
import { checkHealth } from "./GrpcHealth.ts";

export default function useValidateGrpcContext(context: GrpcContextProps) {
  const [valid, setValid] = useState<boolean | null>(null);
  const validating = valid === null;

  useEffect(() => {
    if (validating) {
      validate(context);
    }

    async function validate(context: GrpcContextProps) {
      const { isValid } = await checkHealth(context);
      setValid(isValid);
    }
  }, [context, validating]);

  return { validating, valid };
}
