import { ReactElement } from "react";
import { TabstripNext, TabNext, Badge } from "@salt-ds/lab";

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
