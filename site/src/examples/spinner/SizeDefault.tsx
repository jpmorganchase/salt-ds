import { ReactElement } from "react";
import { Spinner } from "@salt-ds/core";

export const SizeDefault = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="default" />
);
