import { ReactElement } from "react";
import { Pagination, Paginator } from "@salt-ds/lab";

export const Truncation = (): ReactElement => (
  <Pagination count={20} defaultPage={10}>
    <Paginator />
  </Pagination>
);
