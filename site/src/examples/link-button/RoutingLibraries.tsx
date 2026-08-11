import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { MemoryRouter, Link as RouterLink } from "react-router";

export const RoutingLibraries = (): ReactElement => (
  <MemoryRouter>
    <LinkButton
      href="/reports"
      render={({ href, ...props }) => (
        <RouterLink {...props} to={href ?? "/reports"} />
      )}
    >
      View reports
    </LinkButton>
  </MemoryRouter>
);
