import { FlowLayout, Tag } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <FlowLayout>
    <Tag>Primary</Tag>
    <Tag variant="secondary">Secondary</Tag>
  </FlowLayout>
);
