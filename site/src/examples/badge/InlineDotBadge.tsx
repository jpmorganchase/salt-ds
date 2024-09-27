import { Badge } from "@salt-ds/core";
import { TabListNext, TabNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <TabListNext variant="inline" defaultValue="Home" style={{ minWidth: 350 }}>
      <TabNext value="Home">Home</TabNext>
      <TabNext value="Transactions" aria-label="Transactions - New">
        Transactions <Badge />
      </TabNext>
      <TabNext value="Loans">Loans</TabNext>
    </TabListNext>
  );
};
