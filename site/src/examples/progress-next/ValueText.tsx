import { StackLayout } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ValueText = (): ReactElement => (
  <StackLayout gap={3} style={{ width: 320 }}>
    <Progress
      label="Uploading files"
      value={3}
      max={5}
      getValueText={(value, max) => `${value} of ${max} files`}
      description="About 2 minutes left"
    />
    <Progress
      label="Downloading report.pdf"
      value={45}
      getValueText={(value, max) => `${value} of ${max} MB`}
    />
  </StackLayout>
);
