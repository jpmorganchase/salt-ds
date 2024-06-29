import { Pagination, Paginator } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Truncation = (): ReactElement => (
  <Pagination count={20} defaultPage={10}>
    <Paginator />
  </Pagination>
);
