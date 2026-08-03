import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupSurplus } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import persona1 from "../assets/avatar1.png";

export default {
  title: "Lab/Avatar Group/Avatar Group QA",
  component: AvatarGroup,
};

export const AvatarGroupGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={600} width={1000} cols={1} itemPadding={12} {...props}>
    <AvatarGroup>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
    </AvatarGroup>

    <AvatarGroup>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <AvatarGroupSurplus name="2 more">+2</AvatarGroupSurplus>
    </AvatarGroup>
  </QAContainer>
);

AvatarGroupGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
