import { Link, Text } from "@salt-ds/core";
import type { ReactNode } from "react";
import styles from "./Impact.module.css";
import { LinkBase } from "../link/Link";

export function Impact({
  children,
  title,
  action,
}: {
  children?: ReactNode;
  title?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Text styleAs="h1">{title}</Text>
        {children}
        {action && (
          <Link
            className={styles.action}
            href={action.href}
            render={<LinkBase href={action.href} />}
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
