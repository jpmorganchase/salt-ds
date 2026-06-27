import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const MenuCollapsed = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" maxItems={3}>
    <BreadcrumbNext href="#" label="Root Level Entity" />
    <BreadcrumbNext href="#" label="Level 2 Entity" />
    <BreadcrumbNext href="#" label="Level 3 Entity" />
    <BreadcrumbNext href="#" label="Level 4 Entity" />
    <BreadcrumbNext label="Current Level Entity" />
  </BreadcrumbsNext>
);
