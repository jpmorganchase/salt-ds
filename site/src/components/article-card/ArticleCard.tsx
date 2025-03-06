import { Card, Link, Text } from "@salt-ds/core";
import styles from "./ArticleCard.module.css";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { LinkBase } from "../link/Link";

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
        weekday: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  const isMobileOrTablet = useIsMobileView();

  return (
    <Card className={styles.root}>
      <Text maxRows={2} styleAs={isMobileOrTablet ? "h3" : "h2"}>
        {title}
      </Text>
      {date && <Text styleAs="label">{date}</Text>}
      {author && <Text styleAs="label">{author}</Text>}
      {description && <Text maxRows={3}>{description}</Text>}
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
