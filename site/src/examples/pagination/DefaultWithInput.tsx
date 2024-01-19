import { ReactElement } from "react";
import { FlexLayout, Pagination, Paginator, GoToInput } from "@salt-ds/core";

export const DefaultWithInput = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <Paginator />
    </FlexLayout>
  </Pagination>
);
