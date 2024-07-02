import { CompactInput, CompactPaginator, Pagination } from "@salt-ds/core";
import type { ReactElement } from "react";

export const CompactWithInput = (): ReactElement => (
  <Pagination count={20}>
    <CompactPaginator>
      <CompactInput />
    </CompactPaginator>
  </Pagination>
);
