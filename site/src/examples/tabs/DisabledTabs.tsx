import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DisabledTabs = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar inset divider>
        <TabListNext>
          {tabs.map((label) => {
            return (
              <TabNext disabled={label === "Loans"} value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            );
          })}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
