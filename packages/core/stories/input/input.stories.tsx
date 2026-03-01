import {
  Button,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Text,
} from "@salt-ds/core";
import {
  CallIcon,
  CloseIcon,
  CreditCardIcon,
  FilterClearIcon,
  FilterIcon,
  FlagIcon,
  NoteIcon,
  RefreshIcon,
  SendIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

export default {
  title: "Core/Input",
  component: Input,
} as Meta<typeof Input>;

export const Default: StoryFn<typeof Input> = (args) => {
  return <Input defaultValue={args.defaultValue ?? "Value"} {...args} />;
};

export const Controlled: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return <Input {...args} value={value} onChange={handleChange} />;
};

export const Variants: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        variant="primary"
        {...args}
      />
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        variant="secondary"
        {...args}
      />
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        variant="tertiary"
        {...args}
      />
    </FlowLayout>
  );
};

export const Disabled: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input
        disabled={true}
        defaultValue={args.defaultValue ?? "Primary disabled"}
        variant="primary"
        {...args}
      />
      <Input
        disabled={true}
        defaultValue={args.defaultValue ?? "Secondary disabled"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const Placeholder: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input placeholder={"Enter a value"} {...args} />
      <Input disabled placeholder={"Enter a value"} {...args} />
      <Input readOnly placeholder={"Enter a value"} {...args} />
    </FlowLayout>
  );
};

export const Readonly: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input
        readOnly={true}
        defaultValue={args.defaultValue ?? "Primary readonly"}
        variant="primary"
        {...args}
      />
      <Input
        readOnly={true}
        defaultValue={args.defaultValue ?? "Secondary readonly"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const EmptyReadonlyMarker: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input readOnly={true} {...args} />
      <Input readOnly={true} emptyReadOnlyMarker="*" {...args} />
    </FlowLayout>
  );
};

export const TextAlignment: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <Input defaultValue={args.defaultValue ?? "Value"} {...args} />
      <Input
        textAlign="center"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        textAlign="right"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const Validation: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <Input
        defaultValue={args.defaultValue ?? "Error value"}
        validationStatus="error"
        {...args}
      />
      <Input
        defaultValue={args.defaultValue ?? "Warning value"}
        validationStatus="warning"
        {...args}
      />
      <Input
        defaultValue={args.defaultValue ?? "Success value"}
        validationStatus="success"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithStaticAdornments: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <Input
        startAdornment={<FilterIcon />}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <Input
        variant="secondary"
        startAdornment={
          <>
            <CallIcon />
            <Text>+1</Text>
          </>
        }
        defaultValue={args.defaultValue ?? "Value 2"}
        {...args}
      />
      <Input
        endAdornment={<Text>USD</Text>}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <Input
        variant="secondary"
        startAdornment={<FlagIcon />}
        endAdornment={
          <>
            <Text>%</Text>
            <FilterClearIcon />
          </>
        }
        defaultValue={args.defaultValue ?? "Value 2"}
        {...args}
      />
    </FlowLayout>
  );
};

export const WithButtonAdornment: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <Input
        startAdornment={
          <Button>
            <NoteIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        endAdornment={
          <Button sentiment="accented">
            <RefreshIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        startAdornment={
          <>
            <Button>
              <SendIcon />
            </Button>
            <Button sentiment="accented">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        endAdornment={
          <>
            <Button appearance="transparent">
              <CloseIcon />
            </Button>
            <Button sentiment="accented">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        disabled
        endAdornment={
          <>
            <Button disabled>
              <SendIcon />
            </Button>
            <Button disabled variant="secondary">
              <CloseIcon />
            </Button>
            <Button disabled variant="cta">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        readOnly
        startAdornment={
          <>
            <Button disabled>
              <SendIcon />
            </Button>
            <Button disabled variant="secondary">
              <CloseIcon />
            </Button>
            <Button disabled variant="cta">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        disabled
        startAdornment={
          <>
            <Button disabled>
              <CloseIcon />
            </Button>
            <Button disabled appearance="transparent">
              <FlagIcon />
            </Button>
          </>
        }
        endAdornment={
          <Button sentiment="accented" disabled>
            <SendIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const WithValidationAndAdornments: StoryFn<typeof Input> = (args) => {
  const [firstValue, setFirstValue] = useState("1234567890");
  const [secondValue, setSecondValue] = useState("");

  const getFirstStatus = () => {
    return !/^-?\d+$/.test(firstValue) || firstValue.length !== 11
      ? "error"
      : undefined;
  };

  const getSecondStatus = () => {
    return !secondValue.length ? "warning" : undefined;
  };

  const handleFirstChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFirstValue(value);
  };

  const handleSecondChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSecondValue(value);
  };

  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <Input
        startAdornment={
          <>
            <CallIcon />
            <Text>+1</Text>
          </>
        }
        validationStatus={getFirstStatus()}
        {...args}
        value={firstValue}
        onChange={handleFirstChange}
      />
      <Input
        validationStatus={getSecondStatus()}
        {...args}
        endAdornment={<CreditCardIcon />}
        value={secondValue}
        onChange={handleSecondChange}
      />
    </FlowLayout>
  );
};

export const Spellcheck: StoryFn<typeof Input> = () => {
  return (
    <Input
      defaultValue="This is a coment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      spellCheck
      style={{ width: "266px" }}
    />
  );
};

export const Bordered: StoryFn<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <Input bordered defaultValue={args.defaultValue ?? "Value"} {...args} />
      <Input
        bordered
        variant="secondary"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        bordered
        variant="tertiary"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const WithFormField: StoryFn<typeof Input> = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Username</FormFieldLabel>
      <Input {...args} />
      <FormFieldHelperText>
        This should be more than 3 characters long.
      </FormFieldHelperText>
    </FormField>
  );
};
