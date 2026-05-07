import { Badge, Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import type { ReactElement } from "react";

export const InlineBadge = (): ReactElement => (
  <div style={{ width: "100%", minWidth: 0 }}>
    <Tabs defaultValue="Home" style={{ width: "100%", minWidth: 0 }}>
      <TabBar inset divider>
        <TabList>
          <Tab value="Home">
            <TabTrigger>Home</TabTrigger>
          </Tab>
          <Tab value="Transactions">
            <TabTrigger aria-label="Transactions - 30 updates">
              Transactions
              <Badge value={30} />
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
