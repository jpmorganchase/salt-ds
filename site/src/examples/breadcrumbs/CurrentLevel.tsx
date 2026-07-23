import { Breadcrumb, Breadcrumbs } from "@salt-ds/core";
import type { ReactElement } from "react";

export const CurrentLevel = (): ReactElement => (
  <Breadcrumbs aria-label="Breadcrumbs">
    <Breadcrumb href="#">Home</Breadcrumb>
    <Breadcrumb href="#">Level 2</Breadcrumb>
    <Breadcrumb current href="#">
      Level 3
    </Breadcrumb>
    <Breadcrumb href="#">Level 4</Breadcrumb>
  </Breadcrumbs>
);
