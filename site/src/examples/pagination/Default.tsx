import { Pagination, Paginator } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Pagination count={5}>
    <Paginator />
  </Pagination>
);
