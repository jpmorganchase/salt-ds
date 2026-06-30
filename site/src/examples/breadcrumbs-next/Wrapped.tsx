import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Wrapped = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" style={{ width: 250 }} wrap>
    <BreadcrumbNext href="#">Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3 Entity</BreadcrumbNext>
    <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);
