import {
  Tab,
  TabAction,
  TabBar,
  TabList,
  Tabs,
  TabTrigger,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const DismissibleTabs = (): ReactElement => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const { announce } = useAriaAnnouncer();

  const handleDismissTab = (value: string) => {
    setTabs((oldTabs) => oldTabs.filter((tab) => tab !== value));
    announce(`${value} tab has been removed`, 150);
  };

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar inset divider>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger
                  onKeyDown={(event) => {
                    if (event.key === "Delete" && tabs.length > 1) {
                      handleDismissTab(label);
                    }
                  }}
                >
                  {label}
                </TabTrigger>
                {tabs.length > 1 && (
                  <TabAction
                    onClick={() => {
                      handleDismissTab(label);
                    }}
                    aria-label="Dismiss tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabAction>
                )}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
