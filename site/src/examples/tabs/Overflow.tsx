import { Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import type { ReactElement } from "react";

const tabs = [
  "Home",
  "Transactions",
  "Loans",
  "Checks",
  "Liquidity",
  "With",
  "Lots",
  "More",
  "Additional",
  "Tabs",
  "Added",
  "In order to",
  "Showcase overflow",
  "Menu",
  "On",
  "Larger",
  "Screens",
];

export const Overflow = (): ReactElement => {
  return (
    <div style={{ width: "100%", minWidth: 0, maxWidth: 350 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar inset divider>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
