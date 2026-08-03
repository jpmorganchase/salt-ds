import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupSurplus } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Visible = (): ReactElement => {
  return (
    <AvatarGroup>
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <AvatarGroupSurplus name="5 more">+5</AvatarGroupSurplus>
    </AvatarGroup>
  );
};
