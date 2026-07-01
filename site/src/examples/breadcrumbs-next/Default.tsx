import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb">
    <BreadcrumbNext href="#">Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 3 Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);
