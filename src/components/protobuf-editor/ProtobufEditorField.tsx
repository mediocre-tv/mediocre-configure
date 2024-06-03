import { FieldInfo, LongType, ScalarType } from "@protobuf-ts/runtime";
import { Alert, Box } from "@mui/material";
import { useId } from "react";
import { capitalCase } from "change-case";
import {
  BigIntInput,
  BooleanInput,
  FloatInput,
  IntInput,
  StringInput,
} from "./ProtobufEditorFieldInputs.tsx";
import { ProtobufEditorMessage } from "./ProtobufEditorMessage.tsx";

interface ProtobufEditorFieldProps<T> {
  name: string;
  value: T;
  setValue: (value: T) => void;
  info: FieldInfo;
}

export function ProtobufEditorField<T>({
  name,
  value,
  setValue,
  info,
}: ProtobufEditorFieldProps<T>) {
  // this does not cover all possibilities

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
    return (
      <Box width={240}>
        <ProtobufEditorFieldScalarInput
          scalarType={info.T}
          longType={info.L}
          id={id}
          required={required}
          label={label}
          value={value}
          setValue={setValue}
        />
      </Box>
    );
  }

  return (
    <Alert severity="error">
      Could not handle {name} {JSON.stringify(info)}
    </Alert>
  );
}

interface ProtobufEditorFieldScalarInputProps<T> {
  scalarType: ScalarType;
  longType?: LongType;
  id: string;
  required: boolean;
  label: string;
  value: T;
  setValue: (value: T) => void;
}

function ProtobufEditorFieldScalarInput<T>({
  scalarType,
  longType,
  value,
  setValue,
  ...commonProps
}: ProtobufEditorFieldScalarInputProps<T>) {
  // unsure how safe this component really is

  if (scalarType === ScalarType.DOUBLE || scalarType === ScalarType.FLOAT) {
    return (
      <FloatInput
        {...commonProps}
        value={value as number}
        setValue={(value) => setValue(value as T)}
      />
    );
  }

  if (scalarType === ScalarType.BOOL) {
    return (
      <BooleanInput
        {...commonProps}
        value={value as boolean}
        setValue={(value) => setValue(value as T)}
      />
    );
  }

  if (longType === undefined || longType === LongType.NUMBER) {
    return (
      <IntInput
        {...commonProps}
        value={value as number}
        setValue={(value) => setValue(value as T)}
      />
    );
  }

  if (longType === LongType.BIGINT) {
    return (
      <BigIntInput
        {...commonProps}
        value={value as bigint}
        setValue={(value) => setValue(value as T)}
      />
    );
  }

  return (
    <StringInput
      {...commonProps}
      value={value as string}
      setValue={(value) => setValue(value as T)}
    />
  );
}
