import { useAriaAnnouncer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextAction,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const ClosableTabs = (): ReactElement => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const { announce } = useAriaAnnouncer();

  const handleCloseTab = (value: string) => {
    setTabs(tabs.filter((tab) => tab !== value));
    announce(`${value} tab has been removed`, 150);
  };

  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar inset divider>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger
                onKeyDown={(event) => {
                  if (event.key === "Delete") {
                    handleCloseTab(label);
                  }
                }}
              >
                {label}
              </TabNextTrigger>
              {tabs.length > 1 && (
                <TabNextAction
                  onClick={() => {
                    handleCloseTab(label);
                  }}
                  aria-label="Close tab"
                >
                  <CloseIcon aria-hidden />
                </TabNextAction>
              )}
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
