import { ReactElement } from "react";
import { Pagination, CompactPaginator, CompactInput } from "@salt-ds/lab";

export const CompactWithInput = (): ReactElement => (
  <Pagination count={20}>
    <CompactPaginator>
      <CompactInput />
    </CompactPaginator>
  </Pagination>
);
