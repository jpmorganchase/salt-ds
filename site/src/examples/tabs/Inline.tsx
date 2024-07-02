import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Inline = (): ReactElement => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <TabstripNext
      variant="inline"
      defaultValue={tabs[0]}
      style={{ maxWidth: "400px", margin: "auto" }}
    >
      {tabs.map((label) => (
        <TabNext value={label} key={label}>
          {label}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
