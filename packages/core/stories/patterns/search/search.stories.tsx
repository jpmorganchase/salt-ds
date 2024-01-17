import {
  Input,
  Button,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
} from "@salt-ds/core";
import { CloseIcon, EditIcon, SearchIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { ChangeEventHandler, useRef, useState } from "react";

export default {
  title: "Patterns/Search",
} as Meta;

export const DefaultIcon: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <Input
      inputRef={inputRef}
      startAdornment={<SearchIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClear} aria-label="Clear input">
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};

export const DefaultValue: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("default value");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <Input
      inputRef={inputRef}
      startAdornment={<SearchIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClear} aria-label="Clear input">
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      defaultValue="default value"
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};

export const WithFormField: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <FormField>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Input
        inputRef={inputRef}
        startAdornment={<SearchIcon />}
        endAdornment={
          value && (
            <Button onClick={handleClear} aria-label="Clear input">
              <CloseIcon aria-hidden />
            </Button>
          )
        }
        value={value}
        onChange={handleChange}
        style={{ width: 200 }}
      />
      <FormFieldHelperText>Helper Text</FormFieldHelperText>
    </FormField>
  );
};

export const LabelLeft: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <FormField labelPlacement="left">
      <FormFieldLabel>Form field label left</FormFieldLabel>
      <Input
        inputRef={inputRef}
        startAdornment={<SearchIcon />}
        endAdornment={
          value && (
            <Button onClick={handleClear} aria-label="Clear input">
              <CloseIcon aria-hidden />
            </Button>
          )
        }
        value={value}
        onChange={handleChange}
        style={{ width: 200 }}
      />
      <FormFieldHelperText>Helper Text</FormFieldHelperText>
    </FormField>
  );
};

export const DefaultValueNoIcon: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("default value");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <Input
      inputRef={inputRef}
      endAdornment={
        value && (
          <Button onClick={handleClear} aria-label="Clear input">
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      defaultValue="default value"
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};

export const LabelNoIcon: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <FormField>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Input
        inputRef={inputRef}
        endAdornment={
          value && (
            <Button onClick={handleClear} aria-label="Clear input">
              <CloseIcon aria-hidden />
            </Button>
          )
        }
        value={value}
        onChange={handleChange}
        style={{ width: 200 }}
      />
      <FormFieldHelperText>Helper Text</FormFieldHelperText>
    </FormField>
  );
};

export const CustomIcon: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    args.onChange?.(event);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <Input
      inputRef={inputRef}
      startAdornment={<EditIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClear} aria-label="Clear input">
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};
