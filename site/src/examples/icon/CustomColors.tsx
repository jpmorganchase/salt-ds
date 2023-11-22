import { ReactElement } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import { StackLayout } from "@salt-ds/core";

export const CustomColors = (): ReactElement => {
  return (
    <StackLayout direction="row">
      <div style={{ color: "var(--salt-status-positive-foreground)" }}>
        <ArrowUpIcon color="inherit" size={2} />
      </div>
      <ArrowDownIcon
        style={{ fill: "var(--salt-status-negative-foreground)" }}
        size={2}
      />
    </StackLayout>
  );
};
