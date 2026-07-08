import { Tooltip } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import {
  BreadcrumbNext,
  BreadcrumbNextLabel,
  BreadcrumbNextTrigger,
  BreadcrumbsNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ComposedItems = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb">
    <BreadcrumbNext href="#">
      <BreadcrumbNextTrigger>
        <HomeIcon aria-hidden />
        <BreadcrumbNextLabel>Home</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2</BreadcrumbNext>
    <BreadcrumbNext href="#">
      <Tooltip content="Level 3 · Additional context" placement="top">
        <BreadcrumbNextTrigger>
          <BreadcrumbNextLabel>Level 3</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      </Tooltip>
    </BreadcrumbNext>
    <BreadcrumbNext href="#">Current level</BreadcrumbNext>
  </BreadcrumbsNext>
);
