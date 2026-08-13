import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ExternalLink = (): ReactElement => (
  <LinkButton
    href="https://www.saltdesignsystem.com"
    rel="noopener"
    target="_blank"
  >
    Visit Salt
  </LinkButton>
);
