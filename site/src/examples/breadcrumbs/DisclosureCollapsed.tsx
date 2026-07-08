import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const DisclosureCollapsed = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumbs" maxItems={3}>
    <BreadcrumbNext href="#">Home</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3</BreadcrumbNext>
    <BreadcrumbNext href="#">Current level</BreadcrumbNext>
  </BreadcrumbsNext>
);
