import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DisabledTabs = (): ReactElement => {
  return (
    <TabstripNext defaultValue={tabs[0]} align="center">
      {tabs.map((label) => {
        return (
          <TabNext disabled={label === "Loans"} value={label} key={label}>
            {label}
          </TabNext>
        );
      })}
    </TabstripNext>
  );
};
