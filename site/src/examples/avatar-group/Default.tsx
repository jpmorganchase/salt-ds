import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <AvatarGroup aria-label="Team members">
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Smith" color="category-4" />
      <AvatarGroupCount aria-label="3 more">+3</AvatarGroupCount>
    </AvatarGroup>
  );
};
