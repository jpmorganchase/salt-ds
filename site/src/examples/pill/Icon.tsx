import { Pill, PillGroup, StackLayout } from "@salt-ds/core";
import {
  CallIcon,
  CloseIcon,
  GuideClosedIcon,
  UserAdminIcon,
  UserBadgeIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Icon = (): ReactElement => (
  <StackLayout align="center">
    <Pill>
      <UserBadgeIcon aria-hidden />
      Call client
      <CallIcon aria-hidden />
    </Pill>
    <Pill aria-label="Remove jane.smith@jpmchase.com">
      <UserBadgeIcon aria-hidden /> jane.smith@jpmchase.com
      <CloseIcon aria-hidden />
    </Pill>
    <PillGroup aria-label="Select user roles">
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
