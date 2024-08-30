import { Badge, Button, FlexLayout } from "@salt-ds/core";
import { NotificationIcon, SettingsSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const DotBadge = (): ReactElement => (
  <FlexLayout>
    <Button variant="secondary" aria-label="Settings - New available">
      <Badge>
        <SettingsSolidIcon aria-hidden />
      </Badge>
    </Button>
    <Badge>
      <Button aria-label="Notifications - Unread">
        <NotificationIcon aria-hidden />
      </Button>
    </Badge>
  </FlexLayout>
);
