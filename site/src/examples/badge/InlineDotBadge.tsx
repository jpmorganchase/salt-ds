import { Badge } from "@salt-ds/core";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <TabstripNext
      variant="inline"
      defaultValue="Home"
      align="center"
      style={{ minWidth: 350 }}
    >
      <TabNext value="Home">Home</TabNext>
      <TabNext value="Transactions" aria-label="Transactions - New">
        Transactions <Badge />
      </TabNext>
      <TabNext value="Loans">Loans</TabNext>
    </TabstripNext>
  );
};
