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

function getNotificationLabel(label: string) {
  const count = notifications[label];

  if (count === 0 || count === undefined) return "";

  return `, ${count} update${count > 1 ? "s" : ""}`;
}
export const WithBadge = (): ReactElement => {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar divider inset>
          <TabListNext aria-label="Example tablist">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger
                  aria-label={`${label}${getNotificationLabel(label)}`}
                >
                  <span aria-hidden>{label}</span>
                  {notifications[label] > 0 ? (
                    <Badge value={notifications[label]} aria-hidden />
                  ) : undefined}
                </TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </div>
  );
};
