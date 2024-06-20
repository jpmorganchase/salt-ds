import { ReactElement } from "react";
import { FlowLayout } from "@salt-ds/core";
import { Tag } from "@salt-ds/lab";
import { LineChartIcon, ClockIcon } from "@salt-ds/icons";

export const WithIcon = (): ReactElement => (
  <FlowLayout>
    <Tag>
      <LineChartIcon />
      Data
    </Tag>
    <Tag variant="secondary">
      <ClockIcon /> Coming soon
    </Tag>
  </FlowLayout>
);
