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
    <div style={{ width: "100%", minWidth: 0 }}>
      <TabsNext defaultValue="Home" style={{ width: "100%", minWidth: 0 }}>
        <TabBar>
          <TabListNext appearance="transparent">
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
    </div>
  );
};
