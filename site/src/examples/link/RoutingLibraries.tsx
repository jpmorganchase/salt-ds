import { Link } from "@salt-ds/core";
import type { ReactElement } from "react";
import { MemoryRouter, Link as RouterLink } from "react-router";
import styles from "./index.module.css";

export const RoutingLibraries = (): ReactElement => (
  <MemoryRouter>
    <Link
      href="/reports"
      className={styles.linkExample}
      render={({ href, ...props }) => (
        <RouterLink {...props} to={href ?? "/reports"} />
      )}
    >
      View reports
    </Link>
  </MemoryRouter>
);
