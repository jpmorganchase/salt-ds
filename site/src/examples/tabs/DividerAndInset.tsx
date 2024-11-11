import { StackLayout, Switch } from "@salt-ds/core";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DividerAndInset = (): ReactElement => {
  const [divider, setDivider] = useState(true);
  const [inset, setInset] = useState(true);

  return (
    <StackLayout>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar divider={divider} inset={inset}>
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
        <TabBar divider={divider} inset={inset}>
          <TabListNext appearance="transparent">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
      <StackLayout direction="row">
        <Switch
          label="Divider"
          checked={divider}
          onChange={(event) => setDivider(event.target.checked)}
        />
        <Switch
          label="Inset"
          checked={inset}
          onChange={(event) => setInset(event.target.checked)}
        />
      </StackLayout>
    </StackLayout>
  );
};
