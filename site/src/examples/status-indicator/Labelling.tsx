import { ReactElement } from "react";
import { FlowLayout, StackLayout, StatusIndicator, Label } from "@salt-ds/core";

export const Labelling = (): ReactElement => (
  <FlowLayout gap={10}>
    <StackLayout align="center" gap={1}>
      <StatusIndicator status="error" size={2} />
      <Label>
        <b>There has been a system error</b>
      </Label>
      <Label>It should be temporary so please try again</Label>
    </StackLayout>
    <StackLayout align="center" gap={1}>
      <StatusIndicator status="warning" size={2} />
      <Label>
        <b>Access has been denied</b>
      </Label>
      <Label>Please contact your line manager to request access</Label>
    </StackLayout>
  </FlowLayout>
);
