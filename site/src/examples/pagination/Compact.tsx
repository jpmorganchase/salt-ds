import { ReactElement } from "react";
import { Pagination, CompactPaginator } from "@salt-ds/lab";

export const Compact = (): ReactElement => (
  <Pagination count={5}>
    <CompactPaginator />
  </Pagination>
);
