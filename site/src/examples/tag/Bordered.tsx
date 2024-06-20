import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { FlowLayout } from "@salt-ds/core";

export const Bordered = (): ReactElement => (
  <FlowLayout>
    <Tag bordered>Primary</Tag>
    <Tag variant="secondary" bordered>
      Secondary
    </Tag>
  </FlowLayout>
);
