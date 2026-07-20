import { Avatar } from "@salt-ds/core";
import { AvatarGroup } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import persona1 from "../assets/avatar1.png";

export default {
  title: "Lab/Avatar Group/Avatar Group QA",
  component: AvatarGroup,
};

export const AvatarGroupGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={600} width={1000} cols={1} itemPadding={12} {...props}>
    {/* Within max: renders every Avatar, no overflow */}
    <AvatarGroup max={5}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
    </AvatarGroup>

    {/* Exceeds max: default overflow indicator */}
    <AvatarGroup max={3}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
      <Avatar name="Lizzy Lee" color="category-5" />
    </AvatarGroup>
  </QAContainer>
);

AvatarGroupGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
