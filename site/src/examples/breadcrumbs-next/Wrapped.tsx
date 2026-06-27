import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Wrapped = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" style={{ width: 250 }} wrap>
    <BreadcrumbNext href="#" label="Root Level Entity" />
    <BreadcrumbNext href="#" label="Level 2 Entity" />
    <BreadcrumbNext href="#" label="Level 3 Entity" />
    <BreadcrumbNext label="Current Level Entity" />
  </BreadcrumbsNext>
);
