import { Avatar, FlexLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Person = (): ReactElement => (
  <FlexLayout>
    <Avatar name="Alex Brailescu" src={"/img/examples/avatar.png"} />
    <Avatar name="Alex Brailescu" />
    <Avatar />
  </FlexLayout>
);
