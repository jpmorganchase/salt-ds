import { Toggletip, ToggletipPanel, ToggletipTrigger } from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Toggletip",
  component: Toggletip,
} as Meta<typeof Toggletip>;

export const Default: StoryFn<typeof Toggletip> = (props) => (
  <Toggletip {...props}>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>More info</ToggletipPanel>
  </Toggletip>
);
