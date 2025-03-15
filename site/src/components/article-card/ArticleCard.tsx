import { Card, Link, Text } from "@salt-ds/core";
import { LinkBase } from "../link/Link";
import Markdown from "../markdown/Markdown";
import styles from "./ArticleCard.module.css";

export interface ArticleCardProps {
  title: string;
  timestamp?: number;
  author?: string;
  description?: string;
  action: { href: string; label?: string };
}

export function ArticleCard({
  title,
  timestamp,
  author,
  description,
  action,
}: ArticleCardProps) {
  const date = timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card className={styles.root}>
      <div className={styles.content}>
        <div className={styles.title}>
          {date && (
            <Text styleAs="label" color="secondary">
              {date}
            </Text>
          )}
          <Text maxRows={2} styleAs="h2">
            {title}
          </Text>
        </div>
        {author && <Text styleAs="label">{author}</Text>}
        {description && <Markdown>{description}</Markdown>}
      </div>
      {action && (
        <div className={styles.action}>
          <Link href={action.href} render={<LinkBase href={action.href} />}>
            {action.label ?? "Read more"}
          </Link>
        </div>
      )}
    </Card>
  );
}
