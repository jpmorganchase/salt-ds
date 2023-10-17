import { ReactElement } from "react";
import { Spinner } from "@salt-ds/core";

export const SizeSmall = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="small" />
);
