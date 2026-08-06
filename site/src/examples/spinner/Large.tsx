import { Spinner } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Large = (): ReactElement => (
  <Spinner aria-label="loading" disableAnnouncer size="large" />
);
