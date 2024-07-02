import { Spinner } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Medium = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="medium" />
);
