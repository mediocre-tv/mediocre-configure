import { FieldInfo, LongType, ScalarType } from "@protobuf-ts/runtime";
import { useCallback, useEffect, useId } from "react";
import {
  Alert,
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { capitalCase } from "change-case";
import { ProtobufEditorField } from "./ProtobufEditorField.tsx";

function getOneOfKind<T extends object>(
  oneofName: string,
  message: T,
  infos: FieldInfo[],
) {
  const messageAsRecord = message as Record<string, unknown>;
  if (!(oneofName in messageAsRecord)) {
    return null;
  }

  const oneofObject = messageAsRecord[oneofName];
  if (typeof oneofObject !== "object") {
    return null;
  }

  const oneofAsRecord = oneofObject as Record<string, unknown>;
  if (!("oneofKind" in oneofAsRecord)) {
    return null;
  }

  const oneofKind = oneofAsRecord["oneofKind"];
  if (typeof oneofKind !== "string") {
    return null;
  }

  const info = infos.find((info) => info.localName === oneofKind);
  if (!info) {
    return null;
  }

  return {
    kind: info.localName,
    value: oneofAsRecord[oneofKind],
    info: info,
  };
}

function getDefaultValue(info: FieldInfo) {
  // this does not cover all possibilities

  if (info.kind === "message") {
    return info.T().create();
  }

  if (info.kind === "scalar") {
    if (info.T === ScalarType.DOUBLE || info.T === ScalarType.FLOAT) {
      return 0;
    } else if (info.T === ScalarType.BOOL) {
      return false;
    } else if (info.T === ScalarType.BYTES) {
      return new Uint8Array();
    } else if (info.L === undefined || info.L === LongType.NUMBER) {
      return 0;
    } else if (info.L === LongType.BIGINT) {
      return BigInt(0);
    } else {
      return "";
    }
  }
}

interface ProtobufEditorOneofProps<T extends object> {
  oneofName: string;
  message: T;
  setMessage: (value: T) => void;
  defaultInfo: FieldInfo;
  infos: FieldInfo[];
}

export function ProtobufEditorOneof<T extends object>({
  oneofName,
  message,
  setMessage,
  defaultInfo,
  infos,
}: ProtobufEditorOneofProps<T>) {
  const oneofKind = getOneOfKind(oneofName, message, infos);

  const setOneofKind = useCallback(
    (kind: string, value: unknown) =>
      setMessage({
        ...message,
        [oneofName]: { oneofKind: kind, [kind]: value },
      }),
    [message, oneofName, setMessage],
  );

  useEffect(() => {
    if (!oneofKind) {
      setOneofKind(defaultInfo.localName, getDefaultValue(defaultInfo));
    }
  }, [defaultInfo, oneofKind, setOneofKind]);

  if (!oneofKind) {
    return (
      <Alert severity={"warning"}>
        No info for oneofKind field ${oneofName}
      </Alert>
    );
  }

  const { kind, value, info } = oneofKind;

  return (
    <ProtobufEditorOneofField
      name={oneofName}
      kind={kind}
      setKind={(kind: string) => setOneofKind(kind, getDefaultValue(info))}
      value={value}
      setValue={(value) => setOneofKind(kind, value)}
      kinds={infos.map((info) => info.localName)}
      info={info}
    />
  );
}

interface ProtobufEditorOneofFieldProps<T> {
  name: string;
  kind: string;
  setKind: (kind: string) => void;
  value: T;
  setValue: (value: T) => void;
  kinds: string[];
  info: FieldInfo;
}

function ProtobufEditorOneofField<T>({
  name,
  kind,
  setKind,
  value,
  setValue,
  kinds,
  info,
}: ProtobufEditorOneofFieldProps<T>) {
  const selectId = useId();
  const selectLabel = capitalCase(name);
  const onChangeKind = (event: SelectChangeEvent) => {
    setKind(event.target.value);
  };

  return (
    <Stack spacing={3}>
      <Box width={240}>
        <FormControl fullWidth>
          <InputLabel id={selectId}>{selectLabel}</InputLabel>
          <Select
            labelId={selectId}
            label={selectLabel}
            value={kind}
            onChange={onChangeKind}
            sx={{ textAlign: "center" }}
          >
            {kinds.map((kind) => (
              <MenuItem key={kind} value={kind}>
                {capitalCase(kind)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Stack direction="row">
        <Divider orientation="vertical" flexItem></Divider>
        <Box marginLeft={3}>
          <ProtobufEditorField
            name={kind}
            value={value}
            setValue={setValue}
            info={info}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
