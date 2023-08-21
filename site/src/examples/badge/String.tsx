import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";
import { MessageIcon } from "@salt-ds/icons";

export const String = (): ReactElement => (
  <Badge value={"NEW"}>
    <Button>
      <MessageIcon />
    </Button>
  </Badge>
);
