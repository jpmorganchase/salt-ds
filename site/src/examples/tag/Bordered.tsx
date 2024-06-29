import { FlowLayout, Tag } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <FlowLayout>
    <Tag bordered>Primary</Tag>
    <Tag>Primary</Tag>
  </FlowLayout>
);
