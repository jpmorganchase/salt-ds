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

export const Tertiary: ComponentStory<typeof InputNext> = (args) => {
  return (
    <InputNext
      defaultValue={args.defaultValue ?? "Value"}
      variant="tertiary"
      {...args}
    />
  );
};

export const TextAlignments: ComponentStory<typeof InputNext> = (args) => {
  return (
    <>
      <div className="demo alignCenter">
        <InputNext
          defaultValue={args.defaultValue ?? "Value 1"}
          variant="tertiary"
          {...args}
        />
        <InputNext
          defaultValue={args.defaultValue ?? "Value 2"}
          variant="tertiary"
          {...args}
        />
      </div>
      <div className="demo alignRight">
        <InputNext
          defaultValue={args.defaultValue ?? "Value 1"}
          variant="tertiary"
          {...args}
        />
        <InputNext
          defaultValue={args.defaultValue ?? "Value 2"}
          variant="tertiary"
          {...args}
        />
      </div>
    </>
  );
};
