import { ReactElement } from "react";
import { Pagination, Paginator } from "@salt-ds/lab";

export const Truncation = (): ReactElement => (
  <Pagination count={20} initialPage={10}>
    <Paginator />
  </Pagination>
);
