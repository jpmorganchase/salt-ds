import { Avatar } from "@salt-ds/core";
import { WomanIcon } from "@salt-ds/icons";
import { ReactElement } from "react";

export const CustomFallbackIcon = (): ReactElement => {
  return <Avatar name="Alex Brailescu" fallbackIcon={<WomanIcon />} />;
};
