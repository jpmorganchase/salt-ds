import { ReactElement } from "react";
import { Spinner, FlowLayout } from "@salt-ds/core";

export const Size = (): ReactElement => (
  <FlowLayout>
    <Spinner aria-label="loading" role="status" size="large" />
    <Spinner aria-label="loading" role="status" size="default" />
  </FlowLayout>
);
