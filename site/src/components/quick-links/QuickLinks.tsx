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
}: {
  title: string;
  children?: ReactNode;
  action: string;
  href: string;
}) {
  return (
    <LinkBase href={href} passHref legacyBehavior>
      <LinkCard className={styles.card}>
        <div className={styles.cardContent}>
          <Text className={styles.cardTitle} styleAs="h2">
            {title}
          </Text>
          <Text className={styles.cardDescription}>{children}</Text>
        </div>
        {action && (
          <Link className={styles.cardAction} render={<span />}>
            {action}
          </Link>
        )}
      </LinkCard>
    </LinkBase>
  );
}

interface QuickLinkProps extends GridLayoutProps<"div"> {
  links: QuickLinkData[];
}

export function QuickLinks({
  links,
  children,
  ...rest
}: QuickLinkProps): JSX.Element {
  return (
    <GridLayout
      className={styles.root}
      columns={{ md: 4, sm: 2, xs: 1 }}
      gap={{ md: 3, xs: 1 }}
      {...rest}
    >
      {children ||
        links.map(({ href, title, description, action }) => (
          <QuickLink key={href} href={href} title={title} action={action}>
            {description}
          </QuickLink>
        ))}
    </GridLayout>
  );
}
