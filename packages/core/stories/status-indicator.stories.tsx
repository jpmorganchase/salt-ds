import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  StatusIndicator,
  FlowLayout,
  VALIDATION_NAMED_STATUS as status,
} from "@jpmorganchase/uitk-core";

export default {
  title: "Core/StatusIndicator",
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

const DefaultStatusIndicatorStory: ComponentStory<typeof StatusIndicator> = (
  args
) => {
  return <StatusIndicator {...args} />;
};

export const DefaultStatusIndicator = DefaultStatusIndicatorStory.bind({});
DefaultStatusIndicator.args = { status: status[3] };

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
export const AllStatusIndicators = AllStatusIndicatorsStory.bind({});
AllStatusIndicators.argTypes = { status: { control: false } };
