import { Avatar } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import persona1 from "../assets/avatar.png";

export default {
  title: "Core/Avatar/Avatar QA",
  component: Avatar,
} as Meta<typeof Avatar>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Avatar size={1} name="Alex Brailescu" src={persona1 as string} />
    <Avatar size={2} src="bad_url" name="Peter Piper" />
    <Avatar size={3} src="bad_url" />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
