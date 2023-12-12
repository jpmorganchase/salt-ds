import { ReactElement } from "react";
import { Pagination, CompactPaginator, GoToInput } from "@salt-ds/lab";
import { FlexLayout } from "@salt-ds/core";

export const CompactWithGoTo = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <CompactPaginator />
    </FlexLayout>
  </Pagination>
);
