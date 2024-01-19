import { ReactElement } from "react";
import {
  FlexLayout,
  Pagination,
  CompactPaginator,
  GoToInput,
} from "@salt-ds/core";

export const CompactWithGoTo = (): ReactElement => (
  <Pagination count={20}>
    <FlexLayout gap={1}>
      <GoToInput />
      <CompactPaginator />
    </FlexLayout>
  </Pagination>
);
