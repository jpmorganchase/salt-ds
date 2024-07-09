import { FlexLayout, GoToInput, Pagination, Paginator } from "@salt-ds/core";
import type { ReactElement } from "react";

export const DefaultWithInput = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <Paginator />
    </FlexLayout>
  </Pagination>
);
