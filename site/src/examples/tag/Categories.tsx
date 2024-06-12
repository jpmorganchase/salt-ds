import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { FlowLayout } from "@salt-ds/core";

export const Categories = (): ReactElement => (
  <FlowLayout>
    <Tag>Cat-1</Tag>
    <Tag category={2}>Cat-2</Tag>
    <Tag category={3}>Cat-3</Tag>
    <Tag category={4}>Cat-4</Tag>
  </FlowLayout>
);
