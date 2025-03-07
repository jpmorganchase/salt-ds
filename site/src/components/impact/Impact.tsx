import { GridItem, GridLayout, H3, Link, Text } from "@salt-ds/core";
import { LinkBase } from "../link/Link";
import styles from "./Impact.module.css";

export function Impact({
  impacts,
  action,
}: {
  impacts: { title: string; description: string }[];
  action?: { href: string; label: string };
}) {
  return (
    <div className={styles.root}>
      <GridLayout columns={{ xs: 1, md: 2 }}>
        {impacts.map(({ title, description }) => (
          <GridItem className={styles.section} key={title}>
            <H3>{title}</H3>
            <Text>{description}</Text>
          </GridItem>
        ))}
      </GridLayout>
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
  );
}
