import { ReactElement } from "react";
import { Badge, Button } from "@salt-ds/core";
import { NotificationSolidIcon } from "@salt-ds/icons";

export const Default = (): ReactElement => (
  <Badge value={9}>
    <Button aria-label="9 Notifications">
      <NotificationSolidIcon aria-hidden />
    </Button>
  </Badge>
);
