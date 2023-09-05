import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";
import { NotificationSolidIcon } from "@salt-ds/icons";

export const BadgeWithMaximumDigits = (): ReactElement => (
  <Badge value={200} max={99}>
    <Button>
      <NotificationSolidIcon />
    </Button>
  </Badge>
);
