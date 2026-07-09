import { Avatar, AvatarGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Visible = (): ReactElement => {
  return (
    <AvatarGroup max={1}>
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Smith" color="category-4" />
      <Avatar name="Sam Wells" color="category-5" />
      <Avatar name="Maria Garcia" color="category-6" />
      <Avatar name="Liam Chen" color="category-7" />
    </AvatarGroup>
  );
};
