import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { Badge } from "@salt-ds/lab";
import { SettingsSolidIcon } from "@salt-ds/icons";

export const Icon = (): ReactElement => (
  <Badge value={9}>
    <Button>
      <SettingsSolidIcon />
    </Button>
  </Badge>
);
