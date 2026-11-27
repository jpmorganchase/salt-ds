import { FlowLayout, StackLayout } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const States = (): ReactElement => (
  <StackLayout gap={3} style={{ width: 320 }}>
    <Progress label="Uploading report.pdf" value={60} status="paused" />
    <Progress label="Uploading report.pdf" status="success" />
    <Progress
      label="Uploading report.pdf"
      value={60}
      status="error"
      description="The connection was lost. Try again."
    />
    <FlowLayout gap={3}>
      <Progress shape="circular" label="Uploading" value={60} status="paused" />
      <Progress shape="circular" label="Uploading" status="success" />
      <Progress shape="circular" label="Uploading" value={60} status="error" />
    </FlowLayout>
  </StackLayout>
);
