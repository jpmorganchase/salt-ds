import { Breadcrumb, Breadcrumbs } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Breadcrumbs aria-label="Breadcrumbs">
    <Breadcrumb href="#">Home</Breadcrumb>
    <Breadcrumb href="#">Level 2</Breadcrumb>
    <Breadcrumb href="#">Level 3</Breadcrumb>
    <Breadcrumb href="#">Current level</Breadcrumb>
  </Breadcrumbs>
);
