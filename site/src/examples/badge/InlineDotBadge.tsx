import { Badge, Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { NotificationIcon, SettingsSolidIcon } from "@salt-ds/icons";
import { TabNext, TabstripNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineDotBadge = (): ReactElement => {
  return (
    <TabstripNext
      variant="inline"
      defaultValue="Home"
      style={{ maxWidth: "400px", margin: "auto" }}
    >
      <TabNext value="Home">Home</TabNext>
      <TabNext value="Transactions">Transactions</TabNext>
      <TabNext value="Loans">
        Loans
        <Badge />
      </TabNext>
      <TabNext value="Checks">Checks</TabNext>
    </TabstripNext>
  );
};
