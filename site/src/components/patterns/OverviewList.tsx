import { Link } from "@salt-ds/core";
import { LinkBase } from "../link/Link";
import styles from "./OverviewList.module.css";

export interface OverviewListProps {
  patterns: { title: string; link: string; route: string }[];
}

export function OverviewList({ patterns = [] }: OverviewListProps) {
  return (
    <ul className={styles.overviewList}>
      {patterns
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((pattern) => (
          <li key={pattern.route}>
            <Link
              href={pattern.route}
              className={styles.link}
              render={<LinkBase href={pattern.route} />}
            >
              {pattern.title}
            </Link>
          </li>
        ))}
    </ul>
  );
}
