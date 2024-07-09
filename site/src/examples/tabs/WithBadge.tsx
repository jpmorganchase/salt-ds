import { Badge } from "@salt-ds/core";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithBadge = (): ReactElement => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <TabstripNext defaultValue={tabs[0]} align="center">
      {tabs.map((label) => (
        <TabNext value={label} key={label}>
          {label}
          {label === "Transactions" && <Badge value={2} />}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
