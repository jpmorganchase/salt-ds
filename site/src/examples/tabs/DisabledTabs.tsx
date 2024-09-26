import { TabNext, TabListNext, TabsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DisabledTabs = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabListNext align="center">
        {tabs.map((label) => {
          return (
            <TabNext disabled={label === "Loans"} value={label} key={label}>
              {label}
            </TabNext>
          );
        })}
      </TabListNext>
    </TabsNext>
  );
};
