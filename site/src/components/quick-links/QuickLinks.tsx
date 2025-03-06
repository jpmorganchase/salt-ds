import {
  GridLayout,
  type GridLayoutProps,
  Link,
  LinkCard,
  Text,
} from "@salt-ds/core";
import styles from "./QuickLinks.module.css";
import { LinkBase } from "../link/Link";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  action: string;
};

export function QuickLinks({
  links,
  columns = { md: 4, sm: 2, xs: 1 },
}: {
  links: QuickLink[];
  columns?: GridLayoutProps<"div">["columns"];
}): JSX.Element {
  return (
    <GridLayout className={styles.root} columns={columns}>
      {links.map(({ href, title, description, action }) => (
        <LinkBase key={href} href={href} passHref legacyBehavior>
          <LinkCard className={styles.card}>
            <Text styleAs="h2">{title}</Text>
            <Text className={styles.cardDescription}>{description}</Text>
            <Link render={<span />}>{action}</Link>
          </LinkCard>
        </LinkBase>
      ))}
    </GridLayout>
  );
}
