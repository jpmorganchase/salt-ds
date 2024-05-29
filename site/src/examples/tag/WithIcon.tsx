import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { NotificationIcon } from "@salt-ds/icons";

export const WithIcon = (): ReactElement => (
  <Tag>
    <NotificationIcon /> Primary Tag
  </Tag>
);
