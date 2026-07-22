import { Avatar, FlexLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

const user = {
  name: "Alex Brailescu",
  image: "/img/examples/entityAvatar.jpg",
};

const team = {
  name: "Operations",
  initials: "OPS",
};

export const Entity = (): ReactElement => (
  <FlexLayout>
    <Avatar kind="entity" name={user.name} src={user.image} />
    <Avatar
      kind="entity"
      name={team.name}
      nameToInitials={() => team.initials}
    />
    <Avatar kind="entity" />
  </FlexLayout>
);
