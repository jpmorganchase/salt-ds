import { FlowLayout, Tag } from "@salt-ds/core";
import { ChartLineIcon, ClockIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => (
  <FlowLayout>
    <Tag>
      <ChartLineIcon aria-hidden />
      Data
    </Tag>
    <Tag variant="secondary">
      <ClockIcon aria-hidden /> Coming soon
    </Tag>
  </FlowLayout>
);
