import { FlowLayout, Text, Button } from "@salt-ds/core";
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
import { PillInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { ChangeEvent, useState } from "react";

export default {
  title: "Lab/Pill Input",
  component: PillInput,
} as Meta<typeof PillInput>;

export const Default: StoryFn<typeof PillInput> = (args) => {
  return <PillInput defaultValue={args.defaultValue ?? "Value"} {...args} />;
};

export const Controlled: StoryFn<typeof PillInput> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return <PillInput {...args} value={value} onChange={handleChange} />;
};

export const Variants: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout>
      <PillInput
        defaultValue={args.defaultValue ?? "Value"}
        variant="primary"
        {...args}
      />
      <PillInput
        defaultValue={args.defaultValue ?? "Value"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const Disabled: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout>
      <PillInput
        disabled={true}
        defaultValue={args.defaultValue ?? "Primary disabled"}
        variant="primary"
        {...args}
      />
      <PillInput
        disabled={true}
        defaultValue={args.defaultValue ?? "Secondary disabled"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const Placeholder: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout>
      <PillInput placeholder={"Enter a value"} {...args} />
      <PillInput disabled placeholder={"Enter a value"} {...args} />
      <PillInput readOnly placeholder={"Enter a value"} {...args} />
    </FlowLayout>
  );
};

export const Readonly: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout>
      <PillInput
        readOnly={true}
        defaultValue={args.defaultValue ?? "Primary readonly"}
        variant="primary"
        {...args}
      />
      <PillInput
        readOnly={true}
        defaultValue={args.defaultValue ?? "Secondary readonly"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const EmptyReadonlyMarker: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout>
      <PillInput readOnly={true} {...args} />
      <PillInput readOnly={true} emptyReadOnlyMarker="*" {...args} />
    </FlowLayout>
  );
};

export const TextAlignment: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <PillInput defaultValue={args.defaultValue ?? "Value"} {...args} />
      <PillInput
        textAlign="center"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <PillInput
        textAlign="right"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const Validation: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <PillInput
        defaultValue={args.defaultValue ?? "Error value"}
        validationStatus="error"
        {...args}
      />
      <PillInput
        defaultValue={args.defaultValue ?? "Warning value"}
        validationStatus="warning"
        {...args}
      />
      <PillInput
        defaultValue={args.defaultValue ?? "Success value"}
        validationStatus="success"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithStaticAdornments: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <PillInput
        startAdornment={<FilterIcon />}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <PillInput
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
      <PillInput
        endAdornment={<Text>USD</Text>}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <PillInput
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

export const WithButtonAdornment: StoryFn<typeof PillInput> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <PillInput
        startAdornment={
          <Button>
            <NoteIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <PillInput
        endAdornment={
          <Button variant="cta">
            <RefreshIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <PillInput
        startAdornment={
          <>
            <Button>
              <SendIcon />
            </Button>
            <Button variant="cta">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <PillInput
        endAdornment={
          <>
            <Button variant="secondary">
              <CloseIcon />
            </Button>
            <Button variant="cta">
              <FlagIcon />
            </Button>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <PillInput
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
      <PillInput
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
      <PillInput
        disabled
        startAdornment={
          <>
            <Button disabled>
              <CloseIcon />
            </Button>
            <Button disabled variant="secondary">
              <FlagIcon />
            </Button>
          </>
        }
        endAdornment={
          <Button variant="cta" disabled>
            <SendIcon />
          </Button>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const WithValidationAndAdornments: StoryFn<typeof PillInput> = (
  args
) => {
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
      <PillInput
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
      <PillInput
        validationStatus={getSecondStatus()}
        {...args}
        endAdornment={<CreditCardIcon />}
        value={secondValue}
        onChange={handleSecondChange}
      />
    </FlowLayout>
  );
};

export const Spellcheck: StoryFn<typeof PillInput> = () => {
  return (
    <PillInput
      defaultValue="This is a coment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      spellCheck
      style={{ width: "266px" }}
    />
  );
};

export const WithPills: StoryFn<typeof PillInput> = () => {
  return <PillInput pills={["One", "Two"]} />;
};
