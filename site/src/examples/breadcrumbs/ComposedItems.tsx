import {
  Breadcrumb,
  BreadcrumbLabel,
  Breadcrumbs,
  BreadcrumbTrigger,
  Tooltip,
} from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ComposedItems = (): ReactElement => (
  <Breadcrumbs aria-label="Breadcrumbs">
    <Breadcrumb href="#">
      <BreadcrumbTrigger>
        <HomeIcon aria-hidden />
        <BreadcrumbLabel>Home</BreadcrumbLabel>
      </BreadcrumbTrigger>
    </Breadcrumb>
    <Breadcrumb href="#">Level 2</Breadcrumb>
    <Breadcrumb href="#">
      <Tooltip content="Level 3 · Additional context" placement="top">
        <BreadcrumbTrigger>
          <BreadcrumbLabel>Level 3</BreadcrumbLabel>
        </BreadcrumbTrigger>
      </Tooltip>
    </Breadcrumb>
    <Breadcrumb href="#">Current level</Breadcrumb>
  </Breadcrumbs>
);
