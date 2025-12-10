import { Badge } from "@salt-ds/core";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

const notifications: Record<(typeof tabs)[number], number> = {
  Transactions: 1,
  Checks: 6,
};

export const WithBadge = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar divider inset>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>
                {label}
                {notifications[label] > 0 ? (
                  <Badge
                    value={notifications[label]}
                    aria-label={
                      notifications[label] > 1
                        ? `${notifications[label]} updates`
                        : `${notifications[label]} update`
                    }
                  />
                ) : undefined}
              </TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
