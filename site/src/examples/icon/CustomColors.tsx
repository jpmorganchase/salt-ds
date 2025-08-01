import { StackLayout } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const CustomColors = (): ReactElement => {
  return (
    <StackLayout direction="row">
      <div
        style={{
          color: "var(--salt-sentiment-positive-foreground-decorative)",
        }}
      >
        <ArrowUpIcon color="inherit" size={2} />
      </div>
      <ArrowDownIcon
        style={{
          fill: "var(--salt-sentiment-negative-foreground-decorative)",
        }}
        size={2}
      />
    </StackLayout>
  );
};
