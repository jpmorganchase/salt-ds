import { TabBar, TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const ClosableTabs = (): ReactElement => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar separator padding>
        <TabListNext
          onClose={(_event, closedTab) => {
            setTabs(tabs.filter((tab) => tab !== closedTab));
          }}
        >
          {tabs.map((label) => (
            <TabNext value={label} key={label} closable={tabs.length > 1}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
