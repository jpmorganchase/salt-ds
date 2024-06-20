import { ReactElement } from "react";
import { FlowLayout, Tag } from "@salt-ds/core";
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
