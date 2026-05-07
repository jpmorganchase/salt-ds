import { Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import {
  BankCheckIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import type { ComponentType, ReactElement } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

const tabToIcon: Record<string, ComponentType> = {
  Home: HomeIcon,
  Transactions: ReceiptIcon,
  Loans: CreditCardIcon,
  Checks: BankCheckIcon,
  Liquidity: LineChartIcon,
};

export const WithIcon = (): ReactElement => {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar divider inset>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => {
              const Icon = tabToIcon[label];
              return (
                <Tab value={label} key={label}>
                  <TabTrigger>
                    <Icon aria-hidden /> {label}
                  </TabTrigger>
                </Tab>
              );
            })}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
