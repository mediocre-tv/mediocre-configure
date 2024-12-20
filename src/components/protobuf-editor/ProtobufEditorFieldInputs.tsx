import { Slider, Switch, TextField } from "@mui/material";
import { ChangeEvent, useEffect } from "react";
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

type IntInputProps = InputBaseProps<number>;

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

interface SliderInputProps extends InputBaseProps<number | number[]> {
  min: number;
  max: number;
  step?: number;
  shiftStep?: number;
}

export function SliderInput({
  min,
  max,
  step,
  shiftStep,
  value,
  setValue,
  ...otherProps
}: SliderInputProps) {
  const onChange = (_: Event, value: number | number[]) => {
    setValue(value);
  };

  useEffect(() => {
    if (Array.isArray(value) && value.length === 0) {
      setValue([min, max]);
    }
  }, [max, min, setValue, value]);

  return (
    <Slider
      {...otherProps}
      onChange={onChange}
      value={value}
      min={min}
      max={max}
      step={step}
      shiftStep={shiftStep}
      valueLabelDisplay="auto"
    />
  );
}

type FloatInputProps = InputBaseProps<number>;

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

type BigIntInputProps = InputBaseProps<bigint>;

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

type BooleanInputProps = InputBaseProps<boolean>;

export function BooleanInput({ setValue, ...otherProps }: BooleanInputProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.checked);

  return <Switch {...otherProps} onChange={onChange} />;
}

type StringInputProps = InputBaseProps<string>;

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
