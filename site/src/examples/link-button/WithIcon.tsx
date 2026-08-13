import { ArrowRightIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => (
  <LinkButton href="/salt/components/card">
    View card documentation <ArrowRightIcon aria-hidden />
  </LinkButton>
);
