import { ReactElement } from "react";
import { Spinner } from "@salt-ds/core";

export const SizeLarge = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="large" />
);
