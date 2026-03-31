import {
  Avatar,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components/index";

export default {
  title: "Core/Toggletip/Toggletip QA",
  component: Avatar,
} as Meta<typeof Avatar>;

const Template: StoryFn<typeof Toggletip> = (args) => (
  <Toggletip {...args}>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>More info</ToggletipPanel>
  </Toggletip>
);
export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    height={500}
    width={900}
    itemPadding={100}
    vertical
    itemWidthAuto={true}
    {...props}
  >
    <Template placement="top" open />
    <Template placement="right" open />
    <Template placement="bottom" open />
    <Template placement="left" open />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
