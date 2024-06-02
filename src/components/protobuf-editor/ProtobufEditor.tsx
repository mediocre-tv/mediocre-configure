import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useId, useState } from "react";
import {
  containsMessageType,
  FieldInfo,
  IMessageType,
  LongType,
  MESSAGE_TYPE,
  ScalarType,
} from "@protobuf-ts/runtime";
import { capitalCase } from "change-case";

interface ProtobufEditorProps<T extends object> {
  message: T;
  setMessage: (message: T) => void;
}

export default function ProtobufEditor<T extends object>({
  message,
  setMessage,
}: ProtobufEditorProps<T>) {
  const [newMessage, setNewMessage] = useState(message);

  return containsMessageType(newMessage) ? (
    <Box>
      <p>{JSON.stringify(newMessage)}</p>
      <FormControl onSubmit={() => setMessage(newMessage)} fullWidth>
        <ProtobufEditorMessage
          message={newMessage}
          setMessage={setNewMessage}
          messageType={newMessage[MESSAGE_TYPE]}
        />
      </FormControl>
    </Box>
  ) : (
    <Box>
      <Alert severity="error">Could not identify message type</Alert>
    </Box>
  );
}

interface ProtobufEditorMessageProps<T extends object>
  extends ProtobufEditorProps<T> {
  messageType: IMessageType<T>;
}

function ProtobufEditorMessage<T extends object>({
  message,
  setMessage,
  messageType,
}: ProtobufEditorMessageProps<T>) {
  const fieldNameToFieldInfosMap = messageType.fields.reduce(
    (previousMap, currentFieldInfo) => {
      const fieldName = currentFieldInfo.oneof || currentFieldInfo.localName;
      const previousFieldInfos = previousMap.get(fieldName) ?? [];
      const updatedFieldInfos = [...previousFieldInfos, currentFieldInfo];
      previousMap.set(fieldName, updatedFieldInfos);
      return previousMap;
    },
    new Map<string, FieldInfo[]>(),
  );

  const setMessageAsPartial = (message: T) => {
    setMessage(messageType.create(message));
  };

  return Array.from(fieldNameToFieldInfosMap).map(([fieldName, fieldInfos]) => {
    if (fieldInfos.length === 0) {
      throw new Error(`No field infos found for ${fieldName}`);
    }

    const firstFieldInfo = fieldInfos[0];
    const oneofName = firstFieldInfo.oneof;
    if (oneofName) {
      return (
        <ProtobufEditorOneof
          key={fieldName}
          oneofName={oneofName}
          message={message}
          setMessage={setMessageAsPartial}
          defaultInfo={firstFieldInfo}
          infos={fieldInfos}
        />
      );
    } else {
      const messageAsRecord = message as Record<string, unknown>;
      return (
        <ProtobufEditorField
          key={fieldName}
          name={fieldName}
          value={messageAsRecord[fieldName]}
          setValue={(value) =>
            setMessageAsPartial({
              ...message,
              [fieldName]: value,
            })
          }
          info={firstFieldInfo}
        />
      );
    }
  });
}

interface ProtobufEditorFieldProps<T> {
  name: string;
  value: T;
  setValue: (value: T) => void;
  info: FieldInfo;
}

function ProtobufEditorField<T>({
  name,
  value,
  setValue,
  info,
}: ProtobufEditorFieldProps<T>) {
  // this does not cover all possibilities
  // unsure how safe this component really is

  const id = useId();
  const required = !info.opt;
  const label = capitalCase(name);

  if (info.kind === "message") {
    const messageType = info.T();
    const valueOrDefault =
      value && typeof value === "object" && messageType.is(value)
        ? value
        : messageType.create();
    return (
      <ProtobufEditorMessage
        messageType={messageType}
        message={valueOrDefault}
        setMessage={setValue}
      />
    );
  }

  if (info.kind === "scalar") {
    const commonProps = {
      id: id,
      required: required,
      label: label,
      value: value,
    };

    if (info.T === ScalarType.DOUBLE || info.T === ScalarType.FLOAT) {
      return (
        <TextField
          {...commonProps}
          type="number"
          onChange={(event) => {
            const float = parseFloat(event.target.value);
            if (!isNaN(float)) {
              setValue(float as T);
            }
          }}
        />
      );
    } else if (info.T === ScalarType.BOOL) {
      return (
        <Switch
          {...commonProps}
          onChange={(event) => setValue(event.target.checked as T)}
        />
      );
    } else if (info.T === ScalarType.BYTES) {
      return (
        <TextField
          {...commonProps}
          type="text"
          onChange={(event) => {
            setValue(event.target.value as T);
          }}
        />
      );
    } else if (info.L === undefined || info.L === LongType.NUMBER) {
      return (
        <TextField
          {...commonProps}
          type="number"
          onChange={(event) => {
            const int = parseInt(event.target.value);
            if (!isNaN(int)) {
              setValue(int as T);
            }
          }}
        />
      );
    } else if (info.L === LongType.BIGINT) {
      return (
        <TextField
          {...commonProps}
          type="number"
          onChange={(event) => {
            const bigInt = BigInt(event.target.value);
            setValue(bigInt as T);
          }}
        />
      );
    } else {
      return (
        <TextField
          {...commonProps}
          type="text"
          onChange={(event) => {
            setValue(event.target.value as T);
          }}
        />
      );
    }
  }

  return (
    <Alert severity="error">
      Could not handle {name} {JSON.stringify(info)}
    </Alert>
  );
}

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

function ProtobufEditorOneof<T extends object>({
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
    <>
      <FormControl fullWidth>
        <InputLabel id={selectId}>{selectLabel}</InputLabel>
        <Select
          labelId={selectId}
          label={selectLabel}
          value={kind}
          onChange={onChangeKind}
        >
          {kinds.map((kind) => (
            <MenuItem key={kind} value={kind}>
              {capitalCase(kind)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ProtobufEditorField
        name={kind}
        value={value}
        setValue={setValue}
        info={info}
      />
    </>
  );
}
