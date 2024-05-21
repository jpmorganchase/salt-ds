import { StackLayout, Switch } from "@salt-ds/core";
import { TabBar, TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const SeparatorAndPadding = (): ReactElement => {
  const [separator, setSeparator] = useState(true);
  const [padding, setPadding] = useState(true);

  return (
    <StackLayout>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar separator={separator} padding={padding}>
          <TabListNext appearance="bordered">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                {label}
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
      <TabsNext defaultValue={tabs[0]}>
        <TabBar separator={separator} padding={padding}>
          <TabListNext appearance="transparent">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                {label}
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
      <StackLayout direction="row">
        <Switch
          label="Separator"
          checked={separator}
          onChange={(event) => setSeparator(event.target.checked)}
        />
        <Switch
          label="Padding"
          checked={padding}
          onChange={(event) => setPadding(event.target.checked)}
        />
      </StackLayout>
    </StackLayout>
  );
};
