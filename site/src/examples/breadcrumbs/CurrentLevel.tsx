import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CurrentLevel = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumbs">
    <BreadcrumbNext href="#">Home</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2</BreadcrumbNext>
    <BreadcrumbNext current href="#">
      Level 3
    </BreadcrumbNext>
    <BreadcrumbNext href="#">Level 4</BreadcrumbNext>
  </BreadcrumbsNext>
);
