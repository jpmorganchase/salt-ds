import {
  StackLayout,
  Tab,
  TabBar,
  TabList,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Appearance = (): ReactElement => {
  return (
    <StackLayout className={styles.example}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar>
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
        <TabBar>
          <TabList appearance="transparent" aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </StackLayout>
  );
};
