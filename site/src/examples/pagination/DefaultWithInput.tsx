import { ReactElement } from "react";
import { Pagination, Paginator, GoToInput } from "@salt-ds/lab";

export const DefaultWithInput = (): ReactElement => (
  <Pagination count={20}>
    <GoToInput />
    <Paginator />
  </Pagination>
);
