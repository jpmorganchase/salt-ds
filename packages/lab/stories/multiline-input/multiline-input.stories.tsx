import { Button, FlowLayout, Text } from "@salt-ds/core";
import { MultilineInput } from "@salt-ds/lab";
import {
  BookmarkSolidIcon,
  CookieSolidIcon,
  EditSolidIcon,
  FilterClearIcon,
  FilterIcon,
  FlagIcon,
  PinSolidIcon,
} from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ChangeEvent, useState } from "react";

export default {
  title: "Lab/Multiline Input",
  component: MultilineInput,
} as ComponentMeta<typeof MultilineInput>;

export const Default: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      defaultValue="Value"
      style={{ maxWidth: "266px" }}
      {...args}
    />
  );
};

export const Controlled: ComponentStory<typeof MultilineInput> = (args) => {
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

export const NumberOfRows: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      rows={5}
      defaultValue="Value"
      {...args}
      style={{ maxWidth: "266px" }}
    />
  );
};

export const bordered: ComponentStory<typeof MultilineInput> = (args) => {
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

export const Variants: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput defaultValue="Value" {...args} />
      <MultilineInput variant="secondary" defaultValue="Value" {...args} />
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof MultilineInput> = (args) => {
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
export const Readonly: ComponentStory<typeof MultilineInput> = (args) => {
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

export const Placeholder: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      style={{ maxWidth: "266px" }}
      placeholder={"Enter a value"}
      {...args}
    />
  );
};

export const ValidationStates: ComponentStory<typeof MultilineInput> = (
  args
) => {
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

export const Spellcheck: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <MultilineInput
      defaultValue="This is a coment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      spellCheck
      style={{ maxWidth: "266px" }}
      {...args}
    />
  );
};

export const WithAdornments: ComponentStory<typeof MultilineInput> = (args) => {
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
            <Text>%</Text>
            <FilterClearIcon />
          </>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        startAdornment={<FilterIcon />}
        endAdornment={
          <Button>
            <BookmarkSolidIcon />
          </Button>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        readOnly
        endAdornment={
          <Button disabled>
            <CookieSolidIcon />
          </Button>
        }
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithValidationAndAdornments: ComponentStory<
  typeof MultilineInput
> = (args) => {
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
