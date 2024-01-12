import { ReactElement } from "react";
import { Pagination, Paginator, GoToInput } from "@salt-ds/lab";
import { FlexLayout } from "@salt-ds/core";

export const DefaultWithInput = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <Paginator />
    </FlexLayout>
  </Pagination>
);
