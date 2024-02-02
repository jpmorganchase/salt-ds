import { ReactElement } from "react";
import { Badge, Button } from "@salt-ds/core";
import { MessageIcon } from "@salt-ds/icons";

export const BadgeWithString = (): ReactElement => (
  <Badge value={"NEW"}>
    <Button aria-label="New messages">
      <MessageIcon aria-hidden />
    </Button>
  </Badge>
);
