import { Input, FlowLayout, Text, AdornmentButton } from "@salt-ds/core";
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
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ChangeEvent, useState } from "react";

export default {
  title: "Core/Input",
  component: Input,
} as ComponentMeta<typeof Input>;

export const Default: ComponentStory<typeof Input> = (args) => {
  return <Input defaultValue={args.defaultValue ?? "Value"} {...args} />;
};

export const Controlled: ComponentStory<typeof Input> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return <Input {...args} value={value} onChange={handleChange} />;
};

export const Variants: ComponentStory<typeof Input> = (args) => {
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
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof Input> = (args) => {
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

export const Placeholder: ComponentStory<typeof Input> = (args) => {
  return <Input placeholder={"Enter a value"} {...args} />;
};

export const Readonly: ComponentStory<typeof Input> = (args) => {
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

export const EmptyReadonlyMarker: ComponentStory<typeof Input> = (args) => {
  return (
    <FlowLayout>
      <Input readOnly={true} {...args} />
      <Input readOnly={true} emptyReadOnlyMarker="*" {...args} />
    </FlowLayout>
  );
};

export const TextAlignment: ComponentStory<typeof Input> = (args) => {
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

export const Validation: ComponentStory<typeof Input> = (args) => {
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

export const WithStaticAdornments: ComponentStory<typeof Input> = (args) => {
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

export const WithAdornmentButton: ComponentStory<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <Input
        startAdornment={
          <AdornmentButton>
            <NoteIcon />
          </AdornmentButton>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        variant="secondary"
        startAdornment={
          <AdornmentButton variant="cta">
            <RefreshIcon />
          </AdornmentButton>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        endAdornment={
          <AdornmentButton>
            <SendIcon />
          </AdornmentButton>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <Input
        variant="secondary"
        endAdornment={
          <>
            <AdornmentButton variant="secondary">
              <CloseIcon />
            </AdornmentButton>
            <AdornmentButton variant="cta">
              <FlagIcon />
            </AdornmentButton>
          </>
        }
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const WithValidationAndAdornments: ComponentStory<typeof Input> = (
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

export const CursorPositionOnFocus: ComponentStory<typeof Input> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      Start
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        cursorPositionOnFocus="start"
        {...args}
      />
      End
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        cursorPositionOnFocus="end"
        {...args}
      />
      Index 3
      <Input
        defaultValue={args.defaultValue ?? "Value"}
        cursorPositionOnFocus={3}
        {...args}
      />
    </FlowLayout>
  );
};

export const HighlightOnFocus: ComponentStory<typeof Input> = (args) => {
  const [value, setValue] = useState("company@jpmc.com");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <Input
        defaultValue={args.defaultValue ?? "Company name"}
        highlightOnFocus={true}
        {...args}
      />
      <Input
        value={value}
        onChange={handleChange}
        highlightOnFocus={[0, value.indexOf("@")]}
        {...args}
      />
    </FlowLayout>
  );
};
