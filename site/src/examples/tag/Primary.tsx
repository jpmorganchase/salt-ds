import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { FlowLayout } from "@salt-ds/core";

export const Primary = (): ReactElement => (
  <FlowLayout>
    <Tag>Tag</Tag>
    <Tag bordered>Tag</Tag>
  </FlowLayout>
);
