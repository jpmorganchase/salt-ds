import {
  CompactPaginator,
  FlexLayout,
  GoToInput,
  Pagination,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const CompactWithGoTo = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <CompactPaginator />
    </FlexLayout>
  </Pagination>
);
