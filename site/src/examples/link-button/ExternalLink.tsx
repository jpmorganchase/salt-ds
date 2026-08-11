import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ExternalLink = (): ReactElement => (
  <LinkButton
    href="https://www.saltdesignsystem.com"
    rel="noreferrer"
    target="_blank"
  >
    Salt Design System
  </LinkButton>
);
