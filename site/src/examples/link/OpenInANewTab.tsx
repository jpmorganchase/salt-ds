import { Link } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const OpenInANewTab = (): ReactElement => (
  <Link
    href="https://www.saltdesignsystem.com"
    target="_blank"
    rel="noopener"
    className={styles.linkExample}
  >
    Visit Salt
  </Link>
);
