import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineExpansion = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" collapseMode="expand" maxItems={3}>
    <BreadcrumbNext href="#">Home</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3</BreadcrumbNext>
    <BreadcrumbNext>Current level</BreadcrumbNext>
  </BreadcrumbsNext>
);
