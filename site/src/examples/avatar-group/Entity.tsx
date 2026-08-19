import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Entity = (): ReactElement => {
  return (
    <AvatarGroup aria-label="Divisions">
      <Avatar
        kind="entity"
        name="Operations"
        nameToInitials={() => "OPS"}
        color="category-2"
      />
      <Avatar
        kind="entity"
        name="Technology"
        nameToInitials={() => "TEC"}
        color="category-3"
      />
      <Avatar
        kind="entity"
        name="Risk"
        nameToInitials={() => "RSK"}
        color="category-4"
      />
      <AvatarGroupCount kind="entity" aria-label="2 more">
        +2
      </AvatarGroupCount>
    </AvatarGroup>
  );
};
