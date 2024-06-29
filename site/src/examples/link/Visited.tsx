import { Link } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Visited = (): ReactElement => (
  <Link href="#" className={styles.visitedLink}>
    Link with visited style
  </Link>
);
