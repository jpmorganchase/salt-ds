import { ReactElement } from "react";
import { Spinner } from "@salt-ds/core";

export const SizeMedium = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="medium" />
);
