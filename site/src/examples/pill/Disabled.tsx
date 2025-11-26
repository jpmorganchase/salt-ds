import { Pill, PillGroup, StackLayout } from "@salt-ds/core";
import {
  CallIcon,
  CloseIcon,
  GuideClosedIcon,
  UserAdminIcon,
  UserBadgeIcon,
} from "@salt-ds/icons";

import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout align="center">
    <Pill disabled>
      <UserBadgeIcon aria-hidden />
      Call client
      <CallIcon aria-hidden />
    </Pill>
    <Pill aria-label="Remove jane.smith@jpmchase.com" disabled>
      <UserBadgeIcon aria-hidden /> jane.smith@jpmchase.com
      <CloseIcon aria-hidden />
    </Pill>
    <PillGroup disabled aria-label="Select user roles">
      <Pill value="admin">
        <UserAdminIcon aria-hidden /> Admin
      </Pill>
      <Pill value="readOnly">
        <GuideClosedIcon aria-hidden />
        Read-only
      </Pill>
    </PillGroup>
  </StackLayout>
);
