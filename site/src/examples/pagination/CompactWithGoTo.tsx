import { ReactElement } from "react";
import { Pagination, CompactPaginator, GoToInput } from "@salt-ds/lab";

export const CompactWithGoTo = (): ReactElement => (
  <Pagination count={5}>
    <GoToInput />
    <CompactPaginator />
  </Pagination>
);
