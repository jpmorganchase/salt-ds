import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { FlowLayout } from "@salt-ds/core";

export const Subtle = (): ReactElement => (
  <FlowLayout>
    <Tag emphasis="subtle">Tag</Tag>
    <Tag emphasis="subtle">Tag</Tag>
  </FlowLayout>
);
