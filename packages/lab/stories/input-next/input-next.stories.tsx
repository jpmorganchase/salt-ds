import { FlowLayout } from "@salt-ds/core";
import { InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

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

  return (
    <InputNext
      {...args}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
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
