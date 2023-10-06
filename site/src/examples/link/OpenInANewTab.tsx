import { ReactElement } from "react";
import { StackLayout, Link } from "@salt-ds/core";
import { GithubIcon } from "@salt-ds/icons";
import styles from "./index.module.css";

export const OpenInANewTab = (): ReactElement => (
  <StackLayout>
    <Link
      href="https://www.saltdesignsystem.com"
      target="_blank"
      rel="noopener"
      className={styles.linkExample}
    >
      Link with default icon
    </Link>

    <Link
      href="https://github.com/jpmorganchase/salt-ds"
      target="_blank"
      rel="noopener"
      IconComponent={GithubIcon}
      className={styles.linkExample}
    >
      Link with custom icon
    </Link>

    <Link
      href=""
      target="_blank"
      rel="noopener"
      IconComponent={null}
      className={styles.linkExample}
    >
      Link with no icon
    </Link>
  </StackLayout>
);
