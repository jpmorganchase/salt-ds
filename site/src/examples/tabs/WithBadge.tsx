import { Badge } from "@salt-ds/core";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

const notifications: Record<(typeof tabs)[number], number> = {
  Transactions: 1,
  Checks: 6,
};

export const WithBadge = (): ReactElement => {
  return (
    <TabstripNext defaultValue={tabs[0]} align="center">
      {tabs.map((label) => (
        <TabNext value={label} key={label}>
          {label}
          {notifications[label] > 0 ? (
            <Badge value={notifications[label]} />
          ) : undefined}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
