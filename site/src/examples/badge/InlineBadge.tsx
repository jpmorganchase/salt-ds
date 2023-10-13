import { ReactElement } from "react";
import { Badge, TabstripNext, TabNext } from "@salt-ds/lab";
import { StackLayout } from "@salt-ds/core";

export const InlineBadge = (): ReactElement => (
  <TabstripNext
    defaultValue="Home"
    style={{
      maxWidth: 400,
    }}
  >
    <TabNext value="Home">Home</TabNext>
    <TabNext value="Transactions">
      <StackLayout direction="row" gap={1}>
        Transcations
        <Badge value={30} />
      </StackLayout>
    </TabNext>
    <TabNext value="Loans">Loans</TabNext>
  </TabstripNext>
);
