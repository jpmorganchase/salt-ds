import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import persona1 from "../assets/avatar1.png";

export default {
  title: "Lab/Avatar Group/Avatar Group QA",
  component: AvatarGroup,
};

export const AvatarGroupGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={600} width={1000} cols={1} itemPadding={12} {...props}>
    <AvatarGroup aria-label="Team members">
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
    </AvatarGroup>

    <AvatarGroup aria-label="Team members">
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <AvatarGroupCount count={2} />
    </AvatarGroup>

    <AvatarGroup aria-label="Divisions">
      <Avatar kind="entity" name="Alpha" color="category-2" />
      <Avatar kind="entity" name="Beta" color="category-3" />
      <Avatar kind="entity" name="Gamma" color="category-4" />
    </AvatarGroup>

    <AvatarGroup aria-label="Divisions">
      <Avatar kind="entity" name="Alpha" color="category-2" />
      <Avatar kind="entity" name="Beta" color="category-3" />
      <Avatar kind="entity" name="Gamma" color="category-4" />
      <AvatarGroupCount kind="entity" count={2} />
    </AvatarGroup>
  </QAContainer>
);

AvatarGroupGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
