import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Visible = (): ReactElement => {
  return (
    <AvatarGroup aria-label="Team members">
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <AvatarGroupCount name="5 more">+5</AvatarGroupCount>
    </AvatarGroup>
  );
};
