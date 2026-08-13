import { Link } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Visited = (): ReactElement => (
  <Link href="/salt/about/roadmap" className={styles.visitedLink}>
    View roadmap
  </Link>
);
