import { Badge, Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue="Home" style={{ width: "100%", minWidth: 0 }}>
        <TabBar>
          <TabList appearance="transparent">
            <Tab value="Home">
              <TabTrigger>Home</TabTrigger>
            </Tab>
            <Tab value="Transactions">
              <TabTrigger aria-label="Transactions - New">
                Transactions
                <Badge />
              </TabTrigger>
            </Tab>
            <Tab value="Loans">
              <TabTrigger>Loans</TabTrigger>
            </Tab>
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
