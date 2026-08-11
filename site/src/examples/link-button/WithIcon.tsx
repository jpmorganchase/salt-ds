import { ArrowRightIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => (
  <LinkButton href="#">
    View more info <ArrowRightIcon aria-hidden />
  </LinkButton>
);
