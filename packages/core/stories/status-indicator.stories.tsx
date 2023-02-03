import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  StatusIndicator,
  FlowLayout,
  VALIDATION_NAMED_STATUS as status,
} from "@salt-ds/core";

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
} as ComponentMeta<typeof StatusIndicator>;

const AllStatusIndicatorsStory: ComponentStory<typeof StatusIndicator> = (
  args
) => {
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

const Template: ComponentStory<typeof StatusIndicator> = (
  args
) => {
  return <StatusIndicator {...args} />;
};

export const Default = Template.bind({});
Default.args = { status: status[3] };
