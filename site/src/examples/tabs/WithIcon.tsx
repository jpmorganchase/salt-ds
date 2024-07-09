import {
  BankCheckIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ComponentType, ReactElement } from "react";

export const WithIcon = (): ReactElement => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  const tabToIcon: Record<string, ComponentType> = {
    Home: HomeIcon,
    Transactions: ReceiptIcon,
    Loans: CreditCardIcon,
    Checks: BankCheckIcon,
    Liquidity: LineChartIcon,
  };

  return (
    <TabstripNext defaultValue={tabs[0]} align="center">
      {tabs.map((label) => {
        const Icon = tabToIcon[label];
        return (
          <TabNext value={label} key={label}>
            <Icon /> {label}
          </TabNext>
        );
      })}
    </TabstripNext>
  );
};
