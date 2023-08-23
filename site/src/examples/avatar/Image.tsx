import { Avatar } from "@salt-ds/core";
import { ReactElement } from "react";

export const Image = (): ReactElement => {
  return (
    <Avatar name="Alex Brailescu" src={"/img/examples/avatar.png"} />
  );
};
