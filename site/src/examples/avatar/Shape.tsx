import { Avatar, FlowLayout } from "@salt-ds/core";
import { UserGroupSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Shape = (): ReactElement => {
  return (
    <FlowLayout gap={3}>
      <Avatar
        shape="square"
        name="Acme Corporation"
        src={"/img/examples/avatar.png"}
      />

      <Avatar shape="square" name="Salt Design System" />

      <Avatar
        shape="square"
        aria-label="Engineering team"
        fallbackIcon={<UserGroupSolidIcon aria-hidden />}
      />
    </FlowLayout>
  );
};
