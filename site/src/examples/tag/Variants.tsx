import { ReactElement } from "react";
import { FlowLayout, Tag } from "@salt-ds/core";

export const Variants = (): ReactElement => (
  <FlowLayout>
    <Tag>Primary</Tag>
    <Tag variant="secondary">Secondary</Tag>
  </FlowLayout>
);
