import { ReactElement } from "react";
import { Pagination, CompactPaginator, GoToInput } from "@salt-ds/lab";

export const CompactWithGoTo = (): ReactElement => (
  <Pagination count={20}>
    <GoToInput />
    <CompactPaginator />
  </Pagination>
);
