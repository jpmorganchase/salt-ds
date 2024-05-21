import { Badge } from "@salt-ds/core";
import { TabNext, TabstripNext } from "@salt-ds/lab";
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
    <TabstripNext
      defaultValue={tabs[0]}
      onClose={(_event, closedTab) => {
        setTabs(tabs.filter((tab) => tab !== closedTab));
      }}
    >
      {tabs.map((label) => (
        <TabNext value={label} key={label} closable={tabs.length > 1}>
          {label}
          {label === "Transactions" && <Badge value={2} />}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
