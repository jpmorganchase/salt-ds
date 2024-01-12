import { ReactElement } from "react";
import { Pagination, Paginator } from "@salt-ds/lab";

export const Default = (): ReactElement => (
  <Pagination count={5}>
    <Paginator />
  </Pagination>
);
