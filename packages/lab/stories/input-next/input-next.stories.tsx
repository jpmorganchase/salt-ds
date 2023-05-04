import { FlowLayout, Text } from "@salt-ds/core";
import {
  CallIcon,
  CreditCardIcon,
  FilterClearIcon,
  FilterIcon,
  FlagIcon,
} from "@salt-ds/icons";
import { InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ChangeEvent, useState } from "react";

import "./input-next.stories.css";

export default {
  title: "Lab/Input Next",
  component: InputNext,
} as ComponentMeta<typeof InputNext>;

export const Primary: ComponentStory<typeof InputNext> = (args) => {
  return <InputNext defaultValue={args.defaultValue ?? "Value"} {...args} />;
};

export const Secondary: ComponentStory<typeof InputNext> = (args) => {
  return (
    <InputNext
      defaultValue={args.defaultValue ?? "Value"}
      variant="secondary"
      {...args}
    />
  );
};

export const Controlled: ComponentStory<typeof InputNext> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return <InputNext {...args} value={value} onChange={handleChange} />;
};

export const Disabled: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout>
      <InputNext
        disabled={true}
        defaultValue={args.defaultValue ?? "Primary disabled"}
        variant="primary"
        {...args}
      />
      <InputNext
        disabled={true}
        defaultValue={args.defaultValue ?? "Secondary disabled"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const Readonly: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout>
      <InputNext
        readOnly={true}
        defaultValue={args.defaultValue ?? "Primary readonly"}
        variant="primary"
        {...args}
      />
      <InputNext
        readOnly={true}
        defaultValue={args.defaultValue ?? "Secondary readonly"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
};

export const TextAlignments: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout>
      <div className="alignCenter">
        <InputNext defaultValue={args.defaultValue ?? "Value"} {...args} />
      </div>
      <div className="alignRight">
        <InputNext defaultValue={args.defaultValue ?? "Value"} {...args} />
      </div>
    </FlowLayout>
  );
};

export const ValidationStatus: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <InputNext
        defaultValue={args.defaultValue ?? "Error value"}
        validationStatus="error"
        {...args}
      />
      <InputNext
        defaultValue={args.defaultValue ?? "Warning value"}
        validationStatus="warning"
        {...args}
      />
      <InputNext
        defaultValue={args.defaultValue ?? "Success value"}
        validationStatus="success"
        {...args}
      />
    </FlowLayout>
  );
};

export const StaticAdornments: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout style={{ width: "266px" }}>
      <InputNext
        startAdornment={<FilterIcon />}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <InputNext
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
      <InputNext
        endAdornment={<Text>USD</Text>}
        defaultValue={args.defaultValue ?? "Value 1"}
        {...args}
      />
      <InputNext
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

export const WithValidationAndAdornments: ComponentStory<typeof InputNext> = (
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
      <InputNext
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
      <InputNext
        validationStatus={getSecondStatus()}
        {...args}
        endAdornment={<CreditCardIcon />}
        value={secondValue}
        onChange={handleSecondChange}
      />
    </FlowLayout>
  );
};
