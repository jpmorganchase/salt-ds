import {
  FormattedInput,
  type FormattedInputProps,
  FormField,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { useState } from "react";

const parseDigits = (string: string) => (string.match(/(\d+)/g) || []).join("");

const formatValue = (string: string) => {
  const digits = parseDigits(string);
  const chars = digits.split("");
  return chars
    .reduce(
      (r, v, index) => (index === 3 || index === 6 ? `${r}-${v}` : `${r}${v}`),
      "",
    )
    .substring(0, 11);
};

const formatValueWithAppend = (string: string) => {
  const res = formatValue(string);

  if (string.endsWith("-") && (res.length === 3 || res.length === 7)) {
    return `${res}-`;
  }

  return res;
};

const appendHyphen = (string: string) =>
  string.length === 4 || string.length === 8 ? `${string}-` : string;

export default {
  title: "Lab/Formatted Input",
  component: FormattedInput,
};

export const Default: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput defaultValue="Value" style={{ width: 292 }} {...props} />
);

export const Controlled: StoryFn<FormattedInputProps> = ({ onChange }) => {
  const [valueState, setValueState] = useState("");

  const handleChange = (value: string) => {
    setValueState(value);
    onChange?.(value);
  };

  return (
    <FormattedInput
      rifmOptions={{
        accept: /[\d]/g,
        mask: (value) => typeof value === "string" && 11 >= value.length,
        format: formatValueWithAppend,
        append: appendHyphen,
      }}
      style={{ width: 292 }}
      onChange={handleChange}
      value={valueState}
    />
  );
};

export const WithMask: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput
    mask="XXX-XXX-XXX"
    rifmOptions={{
      accept: /[\d]/g,
      mask: (value) => typeof value === "string" && 11 >= value.length,
      format: formatValueWithAppend,
      append: appendHyphen,
    }}
    style={{ width: 292 }}
    {...props}
  />
);

export const FormattingOnly: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput
    defaultValue="123456789"
    rifmOptions={{
      accept: /[\d]/g,
      mask: (value) => typeof value === "string" && 11 >= value.length,
      format: formatValueWithAppend,
      append: appendHyphen,
    }}
    style={{ width: 292 }}
    {...props}
  />
);

export const ReadOnly: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput
    defaultValue="12"
    mask="XXX-XXX-XXX"
    rifmOptions={{
      accept: /[\d]/g,
      mask: (value) => typeof value === "string" && 11 >= value.length,
      format: formatValueWithAppend,
      append: appendHyphen,
    }}
    style={{ width: 292 }}
    readOnly
    {...props}
  />
);

export const Disabled: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput
    defaultValue="123"
    mask="XXX-XXX-XXX"
    rifmOptions={{
      accept: /[\d]/g,
      mask: (value) => typeof value === "string" && 11 >= value.length,
      format: formatValueWithAppend,
      append: appendHyphen,
    }}
    style={{ width: 292 }}
    disabled
    {...props}
  />
);

export const DefaultValue: StoryFn<FormattedInputProps> = (props) => (
  <FormattedInput
    defaultValue="Default Value"
    style={{ width: 292 }}
    {...props}
  />
);

export const WithFormField: StoryFn<FormattedInputProps> = (props) => (
  <FormField label="ADA compliant label" style={{ width: 292 }}>
    <FormattedInput defaultValue="Value" {...props} />
  </FormField>
);

export const WithFormFieldAndMask: StoryFn<FormattedInputProps> = (props) => (
  <FormField label="ADA compliant label" style={{ width: 292 }}>
    <FormattedInput
      defaultValue="123"
      mask="XXX-XXX-XXX"
      rifmOptions={{
        accept: /[\d]/g,
        mask: (value) => typeof value === "string" && 11 >= value.length,
        format: formatValueWithAppend,
        append: appendHyphen,
      }}
      {...props}
    />
  </FormField>
);
