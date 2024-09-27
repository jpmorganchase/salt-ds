import { TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Main = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabListNext>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabListNext>
    </TabsNext>
  );
};
