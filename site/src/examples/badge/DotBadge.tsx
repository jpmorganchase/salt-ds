import { Badge, Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { NotificationIcon, SettingsSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const DotBadge = (): ReactElement => (
  <StackLayout>
    <FlexLayout>
      <Button appearance="transparent" color="neutral">
        <Badge>
          <SettingsSolidIcon />
        </Badge>
      </Button>
    </FlexLayout>
    <FlexLayout>
      <Badge>
        <Button>
          <NotificationIcon />
        </Button>
      </Badge>
    </FlexLayout>
  </StackLayout>
);
