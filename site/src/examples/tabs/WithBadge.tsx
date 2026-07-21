import { Badge, Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
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
      <Tabs defaultValue={tabs[0]}>
        <TabBar divider inset>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger
                  aria-label={`${label}${getNotificationLabel(label)}`}
                >
                  <span aria-hidden>{label}</span>
                  {notifications[label] > 0 ? (
                    <Badge value={notifications[label]} aria-hidden />
                  ) : undefined}
                </TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
