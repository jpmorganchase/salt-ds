import { TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Inline = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabListNext variant="inline">
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabListNext>
    </TabsNext>
  );
};
