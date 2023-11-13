import { ReactElement } from "react";
import { TabstripNext, TabNext } from "@salt-ds/lab";

export const Inline = (): ReactElement => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div>
      <TabstripNext variant="inline" defaultValue={tabs[0]}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};
