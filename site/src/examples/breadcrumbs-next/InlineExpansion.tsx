import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineExpansion = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb" collapseMode="expand" maxItems={3}>
    <BreadcrumbNext href="#">Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 4 Entity</BreadcrumbNext>
    <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);
