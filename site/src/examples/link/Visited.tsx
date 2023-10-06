import { ReactElement } from "react";
import { Link } from "@salt-ds/core";
import styles from "./index.module.css";

export const Visited = (): ReactElement => (
  <Link href="#" className={styles.visitedLink}>
    Link with visited style
  </Link>
);
