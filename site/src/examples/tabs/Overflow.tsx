import { TabBar, TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Overflow = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar separator padding>
        <TabListNext style={{ maxWidth: 350, margin: "auto" }}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
