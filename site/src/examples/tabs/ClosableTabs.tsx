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

  return (
    <TabsNext defaultValue={tabs[0]}>
      <TabBar inset divider>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
              {tabs.length > 1 && (
                <TabNextAction
                  onClick={() => {
                    setTabs(tabs.filter((tab) => tab !== label));
                    announce(`${label} tab has been removed`);
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
