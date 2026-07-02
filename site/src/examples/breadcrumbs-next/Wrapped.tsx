import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Wrapped = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" style={{ width: 250 }} wrap>
    <BreadcrumbNext href="#">Home</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3</BreadcrumbNext>
    <BreadcrumbNext>Current level</BreadcrumbNext>
  </BreadcrumbsNext>
);
