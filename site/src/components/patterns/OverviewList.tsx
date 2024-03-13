import { Link } from "@jpmorganchase/mosaic-components";
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
            <Link href={pattern.route} variant="document">
              {pattern.title}
            </Link>
          </li>
        ))}
    </ul>
  );
}
