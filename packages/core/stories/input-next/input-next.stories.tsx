import { Input, FlowLayout } from "@salt-ds/core";
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
