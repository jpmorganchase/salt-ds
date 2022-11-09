import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  StatusIcon,
  FlowLayout,
  VALIDATION_NAMED_STATUS as status,
} from "@jpmorganchase/uitk-core";

const ICON_SIZES = [1, 2, 3];

export default {
  title: "Core/StatusIcon",
  component: StatusIcon,
  argTypes: {
    size: {
      options: ICON_SIZES,
      control: { type: "select" },
    },
  },
  args: {
    size: ICON_SIZES[0],
  },
} as ComponentMeta<typeof StatusIcon>;

const DefaultStatusIconStory: ComponentStory<typeof StatusIcon> = (args) => {
  return <StatusIcon {...args} />;
};

export const DefaultStatusIcon = DefaultStatusIconStory.bind({});
DefaultStatusIcon.args = { status: status[3] };

const AllStatusIconsStory: ComponentStory<typeof StatusIcon> = (args) => {
  const { size } = args;

  return (
    <FlowLayout>
      {status.map((status, index) => (
        <StatusIcon status={status} key={index} size={size} />
      ))}
    </FlowLayout>
  );
};
export const AllStatusIcons = AllStatusIconsStory.bind({});
AllStatusIcons.argTypes = { status: { control: false } };
