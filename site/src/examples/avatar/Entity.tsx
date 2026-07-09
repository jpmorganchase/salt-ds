import { Avatar, FlexLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Entity = (): ReactElement => (
  <FlexLayout>
    <Avatar
      name="Alex Brailescu"
      src="/img/examples/entityAvatar.jpg"
      kind="entity"
    />
    <Avatar
      name="012"
      kind="entity"
      nameToInitials={(name = "") => name.slice(0, 3)}
    />
    <Avatar kind="entity" />
  </FlexLayout>
);
