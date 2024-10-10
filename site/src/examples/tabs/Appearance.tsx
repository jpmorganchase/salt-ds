import { StackLayout } from "@salt-ds/core";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Appearance = (): ReactElement => {
  return (
    <StackLayout>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar>
          <TabListNext appearance="bordered">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar>
          <TabListNext appearance="transparent">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </StackLayout>
  );
};
