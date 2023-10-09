import { ReactElement } from "react";
import { Link } from "@salt-ds/core";
import styles from "./index.module.css";

export const Default = (): ReactElement => (
  <Link href="#" className={styles.linkExample}>
    Default Link
  </Link>
);
