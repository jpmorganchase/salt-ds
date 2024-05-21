import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Overflow = (): ReactElement => {
  return (
    <TabstripNext
      defaultValue={tabs[0]}
      style={{ maxWidth: 350, margin: "auto" }}
    >
      {tabs.map((label) => (
        <TabNext value={label} key={label}>
          {label}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
