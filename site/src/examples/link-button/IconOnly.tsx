import { ArrowLeftIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <LinkButton aria-label="Go back" href="#">
    <ArrowLeftIcon aria-hidden />
  </LinkButton>
);
