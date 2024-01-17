import {
  Input,
  Button,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
} from "@salt-ds/core";
import { CloseIcon, EditIcon, SearchIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { ChangeEventHandler, useState } from "react";

export default {
  title: "Patterns/Search",
} as Meta;

export const DefaultIcon: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <Input
      startAdornment={<SearchIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClose}>
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      placeholder="Enter your search"
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};

export const DefaultValue: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("default value");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <Input
      startAdornment={<SearchIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClose}>
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <FormField>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Input
        startAdornment={<SearchIcon />}
        endAdornment={
          value && (
            <Button onClick={handleClose}>
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <FormField labelPlacement="left">
      <FormFieldLabel>Form field label left</FormFieldLabel>
      <Input
        startAdornment={<SearchIcon />}
        endAdornment={
          value && (
            <Button onClick={handleClose}>
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <Input
      endAdornment={
        value && (
          <Button onClick={handleClose}>
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <FormField>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Input
        endAdornment={
          value && (
            <Button onClick={handleClose}>
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    setValue(value);
    args.onChange?.(event);
  };

  const handleClose = () => {
    setValue("");
  };

  return (
    <Input
      startAdornment={<EditIcon />}
      endAdornment={
        value && (
          <Button onClick={handleClose}>
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      placeholder="Enter your search"
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};
