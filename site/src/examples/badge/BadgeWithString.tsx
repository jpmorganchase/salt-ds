import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";
import { MessageIcon } from "@salt-ds/icons";

export const BadgeWithString = (): ReactElement => (
  <Badge value={"NEW"}>
    <Button>
      <MessageIcon />
    </Button>
  </Badge>
);
