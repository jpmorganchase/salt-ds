import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb">
    <BreadcrumbNext href="#" label="Root Level Entity" />
    <BreadcrumbNext href="#" label="Level 2 Entity" />
    <BreadcrumbNext label="Level 3 Entity" />
  </BreadcrumbsNext>
);
