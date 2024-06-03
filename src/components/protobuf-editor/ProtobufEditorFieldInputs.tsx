import { Switch, TextField } from "@mui/material";
import { ChangeEvent } from "react";
import { TextFieldProps } from "@mui/material/TextField";

const commonTextFieldProps: TextFieldProps = {
  fullWidth: true,
  InputProps: { inputProps: { style: { textAlign: "center" } } },
};

interface InputBaseProps<T> {
  id: string;
  required: boolean;
  label: string;
  value: T;
  setValue: (value: T) => void;
}

interface IntInputProps extends InputBaseProps<number> {}

export function IntInput({ setValue, ...otherProps }: IntInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const int = parseInt(event.target.value);
    if (!isNaN(int)) {
      setValue(int);
    }
  };

  return (
    <TextField
      {...otherProps}
      {...commonTextFieldProps}
      type="number"
      onChange={onChange}
    />
  );
}

interface FloatInputProps extends InputBaseProps<number> {}

export function FloatInput({ setValue, ...otherProps }: FloatInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const float = parseFloat(event.target.value);
    if (!isNaN(float)) {
      setValue(float);
    }
  };

  return (
    <TextField
      {...otherProps}
      {...commonTextFieldProps}
      type="number"
      onChange={onChange}
    />
  );
}

interface BigIntInputProps extends InputBaseProps<bigint> {}

export function BigIntInput({ setValue, ...otherProps }: BigIntInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const bigInt = BigInt(event.target.value);
    setValue(bigInt);
  };

  return (
    <TextField
      {...otherProps}
      {...commonTextFieldProps}
      type="number"
      onChange={onChange}
    />
  );
}

interface BooleanInputProps extends InputBaseProps<boolean> {}

export function BooleanInput({ setValue, ...otherProps }: BooleanInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.checked);

  return <Switch {...otherProps} onChange={onChange} />;
}

interface StringInputProps extends InputBaseProps<string> {}

export function StringInput({ setValue, ...otherProps }: StringInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <TextField
      {...otherProps}
      {...commonTextFieldProps}
      type="text"
      onChange={onChange}
    />
  );
}
