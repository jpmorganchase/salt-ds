import { InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

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

export const Disabled: ComponentStory<typeof InputNext> = (args) => {
  return (
    <>
      <InputNext
        disabled={true}
        defaultValue={args.defaultValue ?? "Primary disabled"}
        variant="primary"
        {...args}
      />
      <div style={{ height: 16 }} />
      <InputNext
        disabled={true}
        defaultValue={args.defaultValue ?? "Secondary disabled"}
        variant="secondary"
        {...args}
      />
    </>
  );
};

export const Readonly: ComponentStory<typeof InputNext> = (args) => {
  return (
    <>
      <InputNext
        readOnly={true}
        defaultValue={args.defaultValue ?? "Primary readonly"}
        variant="primary"
        {...args}
      />
      <div style={{ height: 16 }} />
      <InputNext
        readOnly={true}
        defaultValue={args.defaultValue ?? "Secondary readonly"}
        variant="secondary"
        {...args}
      />
    </>
  );
};

export const TextAlignments: ComponentStory<typeof InputNext> = (args) => {
  return (
    <>
      <div className="demo alignCenter">
        <InputNext defaultValue={args.defaultValue ?? "Value 1"} {...args} />
        <InputNext defaultValue={args.defaultValue ?? "Value 2"} {...args} />
      </div>
      <div className="demo alignRight">
        <InputNext defaultValue={args.defaultValue ?? "Value 1"} {...args} />
        <InputNext defaultValue={args.defaultValue ?? "Value 2"} {...args} />
      </div>
    </>
  );
};
