import {
  FlowLayout,
  StatusIndicator,
  Text,
  VALIDATION_NAMED_STATUS,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";

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
      {VALIDATION_NAMED_STATUS.map((status) => (
        <StatusIndicator status={status} key={status} size={size} />
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
Default.args = { status: VALIDATION_NAMED_STATUS[3] };

export const WithText: StoryFn<typeof StatusIndicator> = (args) => {
  const { status = "error" } = args;

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--salt-spacing-75)",
        maxWidth: 180,
      }}
    >
      <StatusIndicator
        {...args}
        aria-hidden
        status={status}
        style={{
          marginTop:
            "calc((var(--salt-text-lineHeight) - max(var(--salt-size-icon), 12px)) / 2)",
        }}
      />
      <Text color={status}>
        Request could not be submitted. Please try again later.
      </Text>
    </div>
  );
};
WithText.args = { status: "error" };
WithText.argTypes = { size: { control: false } };
