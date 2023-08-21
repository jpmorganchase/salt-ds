import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";
import { NotificationIcon } from "@salt-ds/icons";

export const MaxNumber = (): ReactElement => (
  <Badge max={99} value={150}>
    <Button>
      <NotificationIcon />
    </Button>
  </Badge>
);
