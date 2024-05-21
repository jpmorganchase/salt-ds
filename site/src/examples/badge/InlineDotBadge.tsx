import { Badge } from "@salt-ds/core";
import { TabBar, TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <TabsNext defaultValue="Home">
      <TabBar>
        <TabListNext appearance="transparent" style={{ minWidth: 350 }}>
          <TabNext value="Home">Home</TabNext>
          <TabNext value="Transactions" aria-label="Transactions - New">
            Transactions <Badge />
          </TabNext>
          <TabNext value="Loans">Loans</TabNext>
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
