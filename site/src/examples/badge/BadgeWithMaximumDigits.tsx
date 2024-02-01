import { ReactElement } from "react";
import { Badge, Button } from "@salt-ds/core";
import { NotificationSolidIcon } from "@salt-ds/icons";

export const BadgeWithMaximumDigits = (): ReactElement => (
  <Badge value={200} max={99}>
    <Button aria-label="200 Notifications">
      <NotificationSolidIcon aria-hidden />
    </Button>
  </Badge>
);
