import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { FlowLayout } from "@salt-ds/core";

export const Variants = (): ReactElement => (
  <FlowLayout>
    <Tag>Primary</Tag>
    <Tag variant="secondary">Secondary</Tag>
  </FlowLayout>
);
