import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Interactive = (): ReactElement => {
  return (
    <AvatarGroup render={<button type="button" aria-label="Team members" />}>
      <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Smith" color="category-4" />
      <AvatarGroupCount name="3 more">+3</AvatarGroupCount>
    </AvatarGroup>
  );
};
