import { FieldInfo, LongType, ScalarType } from "@protobuf-ts/runtime";
import { Alert, Box, Stack } from "@mui/material";
import { useId } from "react";
import { capitalCase } from "change-case";
import {
  BigIntInput,
  BooleanInput,
  FloatInput,
  IntInput,
  SliderInput,
  StringInput,
} from "./ProtobufEditorFieldInputs.tsx";
import { ProtobufEditorMessage } from "./ProtobufEditorMessage.tsx";
import { MediocreFieldOptions } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/options/v1beta/options_pb";
import { getOptions } from "./ProtobufEditorOptions.ts";

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
  const options = getOptions(info);

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
          options={options}
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
  options: MediocreFieldOptions | null;
}

function ProtobufEditorFieldScalarInput<T>({
  scalarType,
  longType,
  value,
  setValue,
  options,
  ...commonProps
}: ProtobufEditorFieldScalarInputProps<T>) {
  // unsure how safe this component really is

  if (scalarType === ScalarType.DOUBLE || scalarType === ScalarType.FLOAT) {
    return (
      <Stack direction="row" alignItems="center" spacing={2}>
        <FloatInput
          {...commonProps}
          value={value as number}
          setValue={(value) => setValue(value as T)}
        />
        {options && options.min !== undefined && options.max !== undefined && (
          <SliderInput
            {...commonProps}
            value={value as number | number[]}
            setValue={(value) => setValue(value as T)}
            min={options.min}
            max={options.max}
            step={0.1}
            shiftStep={10}
          />
        )}
      </Stack>
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
    if (options && options.min !== undefined && options.max !== undefined) {
      return (
        <SliderInput
          {...commonProps}
          value={value as number | number[]}
          setValue={(value) => setValue(value as T)}
          min={options.min}
          max={options.max}
          step={1}
          shiftStep={10}
        />
      );
    }
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
