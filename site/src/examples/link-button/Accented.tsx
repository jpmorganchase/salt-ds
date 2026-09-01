import { LinkButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Accented = (): ReactElement => (
  <LinkButton href="/salt/getting-started" sentiment="accented">
    Get started
  </LinkButton>
);
