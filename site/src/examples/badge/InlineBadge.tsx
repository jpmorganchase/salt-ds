import { Badge } from "@salt-ds/core";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineBadge = (): ReactElement => (
  <TabstripNext
    defaultValue="Home"
    style={{
      minWidth: 350,
    }}
  >
    <TabNext value="Home">Home</TabNext>
    <TabNext value="Transactions" aria-label="Transations - 30 updates">
      Transactions
      <Badge value={30} />
    </TabNext>
    <TabNext value="Loans">Loans</TabNext>
  </TabstripNext>
);
