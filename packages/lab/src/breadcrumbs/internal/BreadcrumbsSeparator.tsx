import React, { FC } from "react";
import { IconProps } from "@jpmorganchase/uitk-core";
import { ChevronRightIcon } from "@jpmorganchase/icons";

export const BreadcrumbsSeparator: FC<IconProps> = (props) => (
  <ChevronRightIcon {...props} />
);
