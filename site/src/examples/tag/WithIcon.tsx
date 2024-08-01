import { FlowLayout, Tag } from "@salt-ds/core";
import { ClockIcon, LineChartIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

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
