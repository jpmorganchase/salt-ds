import { Badge } from "@salt-ds/core";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineBadge = (): ReactElement => (
  <TabsNext defaultValue="Home">
    <TabBar inset divider>
      <TabListNext
        style={{
          minWidth: 350,
        }}
      >
        <TabNext value="Home">
          <TabNextTrigger>Home</TabNextTrigger>
        </TabNext>
        <TabNext value="Transactions">
          <TabNextTrigger aria-label="Transactions - 30 updates">
            Transactions
            <Badge value={30} />
          </TabNextTrigger>
        </TabNext>
        <TabNext value="Loans">
          <TabNextTrigger>Loans</TabNextTrigger>
        </TabNext>
      </TabListNext>
    </TabBar>
  </TabsNext>
);
