import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  StateIcon,
  FlowLayout,
  VALIDATION_NAMED_STATES as states,
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

const DefaultStateIconStory: ComponentStory<typeof StateIcon> = (args) => {
  return <StateIcon {...args} />;
};

export const DefaultStateIcon = DefaultStateIconStory.bind({});
DefaultStateIcon.args = { state: states[3] };

const AllStateIconsStory: ComponentStory<typeof StateIcon> = (args) => {
  const { size } = args;

  return (
    <FlowLayout>
      {states.map((state, index) => (
        <StateIcon state={state} key={index} size={size} />
      ))}
    </FlowLayout>
  );
};
export const AllStateIcons = AllStateIconsStory.bind({});
AllStateIcons.argTypes = { state: { control: false } };
