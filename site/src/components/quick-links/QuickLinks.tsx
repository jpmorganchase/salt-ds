import {
  GridLayout,
  type GridLayoutProps,
  Link,
  LinkCard,
  Text,
} from "@salt-ds/core";
import type { ReactNode } from "react";
import { LinkBase } from "../link/Link";
import styles from "./QuickLinks.module.css";

type QuickLinkData = {
  href: string;
  title: string;
  description: string;
  action: string;
};

export function QuickLink({
  title,
  children,
  action,
  href,
}: { title: string; children?: ReactNode; action: string; href: string }) {
  return (
    <LinkBase href={href} passHref legacyBehavior>
      <LinkCard className={styles.card}>
        <Text styleAs="h2">{title}</Text>
        <Text className={styles.cardDescription}>{children}</Text>
        <Link render={<span />}>{action}</Link>
      </LinkCard>
    </LinkBase>
  );
}

export function QuickLinks({
  links,
  children,
  columns = { md: 4, sm: 2, xs: 1 },
}: {
  children?: ReactNode;
  links: QuickLinkData[];
  columns?: GridLayoutProps<"div">["columns"];
}): JSX.Element {
  return (
    <GridLayout className={styles.root} columns={columns}>
      {children ||
        links.map(({ href, title, description, action }) => (
          <QuickLink key={href} href={href} title={title} action={action}>
            {description}
          </QuickLink>
        ))}
    </GridLayout>
  );
}
