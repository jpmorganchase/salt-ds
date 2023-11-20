import { ReactElement } from "react";
import { Pagination, Paginator, GoToInput } from "@salt-ds/lab";

export const WithInput = (): ReactElement => (
  <Pagination count={5}>
    <GoToInput />
    <Paginator />
  </Pagination>
);
