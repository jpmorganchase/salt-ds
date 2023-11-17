import { ReactElement } from "react";
import { TabstripNext, TabNext } from "@salt-ds/lab";
import { Badge } from "@salt-ds/core";

export const WithBadge = (): ReactElement => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div>
      <TabstripNext defaultValue={tabs[0]}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
            {label === "Transactions" && <Badge value={2} />}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};
