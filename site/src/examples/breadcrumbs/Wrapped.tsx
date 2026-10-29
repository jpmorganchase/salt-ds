import { Breadcrumb, Breadcrumbs } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Wrapped = (): ReactElement => (
  <Breadcrumbs aria-label="Breadcrumbs" style={{ width: 250 }} wrap>
    <Breadcrumb href="#">Home</Breadcrumb>
    <Breadcrumb href="#">Level 2</Breadcrumb>
    <Breadcrumb href="#">Level 3</Breadcrumb>
    <Breadcrumb href="#">Current level</Breadcrumb>
  </Breadcrumbs>
);
