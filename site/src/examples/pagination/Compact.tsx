import { ReactElement } from "react";
import { Pagination, CompactPaginator } from "@salt-ds/core";

export const Compact = (): ReactElement => (
  <Pagination count={20}>
    <CompactPaginator />
  </Pagination>
);
