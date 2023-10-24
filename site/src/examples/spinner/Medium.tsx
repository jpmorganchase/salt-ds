import { ReactElement } from "react";
import { Spinner } from "@salt-ds/core";

export const Medium = (): ReactElement => (
  <Spinner aria-label="loading" role="status" size="medium" />
);
