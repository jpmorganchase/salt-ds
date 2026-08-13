import { ArrowLeftIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <LinkButton aria-label="Back to components" href="/salt/components">
    <ArrowLeftIcon aria-hidden />
  </LinkButton>
);
