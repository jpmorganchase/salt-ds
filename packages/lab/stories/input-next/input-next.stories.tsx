import { FlowLayout } from "@salt-ds/core";
import { InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ChangeEvent, useState } from "react";

export default {
  title: "Lab/Input Next",
  component: InputNext,
} as ComponentMeta<typeof InputNext>;

export const Default: ComponentStory<typeof InputNext> = (args) => {
  return <InputNext defaultValue={args.defaultValue ?? "Value"} {...args} />;
};

export const Controlled: ComponentStory<typeof InputNext> = (args) => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return <InputNext {...args} value={value} onChange={handleChange} />;
};

export const Variants: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout>
      <InputNext
        defaultValue={args.defaultValue ?? "Value"}
        variant="primary"
        {...args}
      />
      <InputNext
        defaultValue={args.defaultValue ?? "Value"}
        variant="secondary"
        {...args}
      />
    </FlowLayout>
  );
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

export const EmptyReadonlyMarker: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout>
      <InputNext readOnly={true} {...args} />
      <InputNext readOnly={true} emptyReadOnlyMarker="*" {...args} />
    </FlowLayout>
  );
};

export const TextAlignment: ComponentStory<typeof InputNext> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "266px" }}>
      <InputNext defaultValue={args.defaultValue ?? "Value"} {...args} />
      <InputNext
        textAlign="center"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <InputNext
        textAlign="right"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const Validation: ComponentStory<typeof InputNext> = (args) => {
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
