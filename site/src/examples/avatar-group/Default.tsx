import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupSurplus } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <AvatarGroup>
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Smith" color="category-4" />
      <AvatarGroupSurplus name="3 more">+3</AvatarGroupSurplus>
    </AvatarGroup>
  );
};
