import { ReactElement } from "react";
import { LinearProgress, StackLayout } from "@salt-ds/core";

export const Linear = (): ReactElement => (
  <StackLayout>
    <LinearProgress aria-label="Download" value={38} />
    <LinearProgress aria-label="Download" variant="indeterminate" />
  </StackLayout>
);
