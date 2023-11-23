import { ReactElement } from "react";
import { Pagination, CompactPaginator } from "@salt-ds/lab";

export const CompactWithInput = (): ReactElement => (
  <Pagination count={20}>
    <CompactPaginator withInput />
  </Pagination>
);
