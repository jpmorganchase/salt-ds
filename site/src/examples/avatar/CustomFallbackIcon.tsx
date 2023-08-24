import { Avatar } from "@salt-ds/core";
import { WomanIcon } from "@salt-ds/icons";
import { ReactElement } from "react";

export const CustomFallbackIcon = (): ReactElement => {
  return <Avatar aria-label="Woman Avatar" fallbackIcon={<WomanIcon />} />;
};
