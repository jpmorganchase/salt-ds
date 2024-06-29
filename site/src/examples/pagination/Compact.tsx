import { CompactPaginator, Pagination } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Compact = (): ReactElement => (
  <Pagination count={20}>
    <CompactPaginator />
  </Pagination>
);
