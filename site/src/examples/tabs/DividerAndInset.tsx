import {
  StackLayout,
  Switch,
  Tab,
  TabBar,
  TabList,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DividerAndInset = (): ReactElement => {
  const [divider, setDivider] = useState(true);
  const [inset, setInset] = useState(true);

  return (
    <StackLayout style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar divider={divider} inset={inset}>
          <TabList appearance="bordered" aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
      <Tabs defaultValue={tabs[0]}>
        <TabBar divider={divider} inset={inset}>
          <TabList appearance="transparent">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
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
