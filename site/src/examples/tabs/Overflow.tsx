import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = [
  "Home",
  "Transactions",
  "Loans",
  "Checks",
  "Liquidity",
  "With",
  "Lots",
  "More",
  "Additional",
  "Tabs",
  "Added",
  "In order to",
  "Showcase overflow",
  "Menu",
  "On",
  "Larger",
  "Screens",
];

export const Overflow = (): ReactElement => {
  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar separator padding>
        <TabListNext style={{ maxWidth: 350, margin: "auto" }}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
