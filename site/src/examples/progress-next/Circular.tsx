import { FlowLayout, StackLayout } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Circular = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout gap={3} align="center">
      <Progress shape="circular" size="small" aria-label="Loading" />
      <Progress shape="circular" label="Loading accounts" />
      <Progress shape="circular" size="large" label="Loading accounts" />
    </FlowLayout>
    <FlowLayout gap={3} align="center">
      <Progress
        shape="circular"
        size="small"
        aria-label="Uploading"
        value={38}
      />
      <Progress shape="circular" label="Uploading" value={38} />
      <Progress shape="circular" size="large" label="Uploading" value={38} />
    </FlowLayout>
  </StackLayout>
);
