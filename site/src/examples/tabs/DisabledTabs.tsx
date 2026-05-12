import { Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DisabledTabs = (): ReactElement => {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar inset divider>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => {
              return (
                <Tab disabled={label === "Loans"} value={label} key={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              );
            })}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
