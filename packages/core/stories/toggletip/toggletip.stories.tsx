import {
  Display3,
  Link,
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Toggletip",
  component: Toggletip,
} as Meta<typeof Toggletip>;

const Template: StoryFn<typeof Toggletip> = (args) => (
  <Toggletip {...args}>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>More info</ToggletipPanel>
  </Toggletip>
);

export const Default: StoryFn<typeof Toggletip> = Template.bind({});

export const LeftPlacement: StoryFn<typeof Toggletip> = Template.bind({});
LeftPlacement.args = {
  placement: "left",
};

export const TopPlacement: StoryFn<typeof Toggletip> = Template.bind({});
TopPlacement.args = {
  placement: "top",
};

export const BottomPlacement: StoryFn<typeof Toggletip> = Template.bind({});
BottomPlacement.args = {
  placement: "bottom",
};

export const RightPlacement: StoryFn<typeof Toggletip> = Template.bind({});
RightPlacement.args = {
  placement: "right",
};

export const LongContent: StoryFn<typeof Toggletip> = (args) => (
  <Toggletip {...args}>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel style={{ maxHeight: 100 }}>
      <StackLayout gap={1}>
        <Text>
          This example text is intended to demonstrate layout and formatting
          within the component. The content shown here is for illustrative
          purposes and does not represent actual information or advice.
        </Text>
        <Text>
          Sample paragraphs like this can be used to visualize how text will
          appear in different scenarios. The wording is generic and designed to
          help review spacing, alignment, and overall presentation in the user
          interface.
        </Text>
      </StackLayout>
    </ToggletipPanel>
  </Toggletip>
);

export const InteractiveContent: StoryFn<typeof Toggletip> = (args) => (
  <Toggletip {...args}>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>
      <StackLayout gap={1}>
        <Text>
          <strong>Title</strong>
        </Text>
        <Text>Content</Text>
        <Link href="#">Link</Link>
      </StackLayout>
    </ToggletipPanel>
  </Toggletip>
);

export const WithMetric: StoryFn<typeof Toggletip> = (args) => (
  <StackLayout gap={0}>
    <StackLayout direction="row" gap={1}>
      <Text>
        <strong>Active users</strong>
      </Text>
      <Toggletip {...args}>
        <ToggletipTrigger aria-label="Active users explanation">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>
          <Text>
            Users who have logged in at least once in the past 7 days.
          </Text>
        </ToggletipPanel>
      </Toggletip>
    </StackLayout>
    <Display3>14,209</Display3>
  </StackLayout>
);
