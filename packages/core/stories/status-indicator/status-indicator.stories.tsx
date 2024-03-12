import { Meta, StoryFn } from "@storybook/react";
import {
  StatusIndicator,
  FlowLayout,
  VALIDATION_NAMED_STATUS as status,
} from "@salt-ds/core";
import { SaltShakerIcon } from "@salt-ds/icons";

export default {
  title: "Core/Status Indicator",
  component: StatusIndicator,
  argTypes: {
    size: {
      control: { type: "number" },
    },
  },
  args: {
    size: 1,
  },
} as Meta<typeof StatusIndicator>;

const AllStatusIndicatorsStory: StoryFn<typeof StatusIndicator> = (args) => {
  const { size } = args;

  return (
    <FlowLayout>
      {status.map((status, index) => (
        <StatusIndicator status={status} key={index} size={size} />
      ))}
    </FlowLayout>
  );
};
export const All = AllStatusIndicatorsStory.bind({});
All.argTypes = { status: { control: false } };

const Template: StoryFn<typeof StatusIndicator> = (args) => {
  return <StatusIndicator {...args} />;
};

export const Default = Template.bind({});
Default.args = { status: status[3] };

export const CustomIcon = Template.bind({});
CustomIcon.args = { icon: SaltShakerIcon, status: status[1] };
