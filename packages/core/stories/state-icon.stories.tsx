import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  StateIcon,
  ValidationState,
  FlowLayout,
} from "@jpmorganchase/uitk-core";
import { ICON_NAMED_SIZES } from "@jpmorganchase/uitk-icons";

export default {
  title: "Core/StateIcon",
  component: StateIcon,
  argTypes: {
    size: {
      options: ICON_NAMED_SIZES,
      control: { type: "select" },
      defaultValue: ICON_NAMED_SIZES[0],
    },
  },
} as ComponentMeta<typeof StateIcon>;

const states: ValidationState[] = ["error", "success", "warning", "info"];

const DefaultStateIconStory: ComponentStory<typeof StateIcon> = (args) => {
  return <StateIcon {...args} />;
};

export const DefaultStateIcon = DefaultStateIconStory.bind({});
DefaultStateIcon.args = { state: states[3] };

export const AllStateIcons: ComponentStory<typeof StateIcon> = () => {
  return (
    <FlowLayout>
      {states.map((state, index) => (
        <StateIcon state={state} key={index} />
      ))}
    </FlowLayout>
  );
};
