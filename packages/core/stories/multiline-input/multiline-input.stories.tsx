import { Button, FlowLayout, Label, MultilineInput, Text } from "@salt-ds/core";
import {
  BankCheckSolidIcon,
  BookmarkSolidIcon,
  EditSolidIcon,
  FilterClearIcon,
  FlagIcon,
  HelpSolidIcon,
  PinSolidIcon,
  SendIcon,
  UserBadgeIcon,
} from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { ChangeEvent, useState } from "react";

export default {
  title: "Core/Multiline Input",
  component: MultilineInput,
} as Meta<typeof MultilineInput>;

export const Default: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      defaultValue="Value"
      style={{ maxWidth: "266px" }}
      {...args}
    />
  );
};

export const Controlled: StoryFn<typeof MultilineInput> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return (
    <MultilineInput
      {...args}
      value={value}
      onChange={handleChange}
      style={{ maxWidth: "266px" }}
    />
  );
};

export const NumberOfRows: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      rows={5}
      defaultValue="Value"
      {...args}
      style={{ maxWidth: "266px" }}
    />
  );
};

export const Bordered: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput bordered defaultValue="Value" {...args} />
      <MultilineInput
        variant="secondary"
        bordered
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const Variants: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput defaultValue="Value" {...args} />
      <MultilineInput variant="secondary" defaultValue="Value" {...args} />
    </FlowLayout>
  );
};

export const Disabled: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput disabled defaultValue="Value" {...args} />
      <MultilineInput
        disabled
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput disabled bordered defaultValue="Value" {...args} />
      <MultilineInput
        disabled
        bordered
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const CharacterCount: StoryFn<typeof MultilineInput> = (args) => {
  const [value, setValue] = useState<string>("Value");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 10;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <MultilineInput
      {...args}
      endAdornment={
        <Label variant={!isError ? "secondary" : "primary"}>
          {!isError && `${value.length}/${MAX_CHARS}`}
          {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
        </Label>
      }
      style={{ width: "266px" }}
      onChange={handleChange}
      value={value}
      validationStatus={isError ? "error" : undefined}
    />
  );
};

export const Readonly: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput readOnly defaultValue="Value" {...args} />
      <MultilineInput
        readOnly
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput readOnly bordered defaultValue="Value" {...args} />
      <MultilineInput
        readOnly
        bordered
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const Placeholder: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      style={{ maxWidth: "266px" }}
      placeholder={"Enter a value"}
      {...args}
    />
  );
};

export const ValidationStates: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput validationStatus="error" defaultValue="Value" {...args} />
      <MultilineInput
        bordered
        validationStatus="error"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        validationStatus="warning"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        bordered
        validationStatus="warning"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        validationStatus="success"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        bordered
        validationStatus="success"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const Spellcheck: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      defaultValue="This is a coment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      spellCheck
      style={{ maxWidth: "266px" }}
      {...args}
    />
  );
};

export const WithAdornments: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput
        startAdornment={
          <Button variant="cta">
            <EditSolidIcon />
          </Button>
        }
        endAdornment={
          <>
            <Text>GBP</Text>
            <Button variant="secondary">
              <HelpSolidIcon />
            </Button>
            <Button variant="cta">
              <SendIcon />
            </Button>
          </>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        startAdornment={<Text>£</Text>}
        endAdornment={
          <Button>
            <BookmarkSolidIcon />
          </Button>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        disabled
        endAdornment={
          <Button disabled>
            <UserBadgeIcon />
          </Button>
        }
        defaultValue="Disabled value"
        {...args}
      />
      <MultilineInput
        readOnly
        endAdornment={
          <Button variant="secondary" disabled>
            <BankCheckSolidIcon />
          </Button>
        }
        defaultValue="Readonly value"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithMultipleFeatures: StoryFn<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput
        startAdornment={<FlagIcon />}
        endAdornment={<PinSolidIcon />}
        validationStatus="success"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        startAdornment={<FlagIcon />}
        endAdornment={
          <>
            <Text>%</Text>
            <FilterClearIcon />
          </>
        }
        validationStatus="error"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};
