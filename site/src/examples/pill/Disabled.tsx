import { Pill, PillGroup, StackLayout } from "@salt-ds/core";
import { ChevronDownIcon, CloseIcon, UserBadgeIcon } from "@salt-ds/icons";

import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout align="center">
    <Pill disabled>
      <UserBadgeIcon aria-hidden />
      Client
      <ChevronDownIcon aria-hidden />
    </Pill>
    <Pill disabled>
      <UserBadgeIcon aria-hidden /> jane.smith@jpmchase.com
      <CloseIcon aria-hidden />
    </Pill>
    <PillGroup disabled>
      <Pill value="admin">
        <UserBadgeIcon aria-hidden /> Admin
      </Pill>
      <Pill value="readOnly">
        <UserBadgeIcon aria-hidden />
        Read-only
      </Pill>
    </PillGroup>
  </StackLayout>
);
