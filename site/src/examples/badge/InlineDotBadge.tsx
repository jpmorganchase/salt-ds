import { Badge } from "@salt-ds/core";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <TabsNext defaultValue="Home">
      <TabBar>
        <TabListNext appearance="transparent" style={{ minWidth: 350 }}>
          <TabNext value="Home">
            <TabNextTrigger>Home</TabNextTrigger>
          </TabNext>
          <TabNext value="Transactions">
            <TabNextTrigger aria-label="Transactions - New">
              Transactions
              <Badge />
            </TabNextTrigger>
          </TabNext>
          <TabNext value="Loans">
            <TabNextTrigger>Loans</TabNextTrigger>
          </TabNext>
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
