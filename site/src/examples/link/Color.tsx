import { ReactElement } from "react";
import { Link, StackLayout } from "@salt-ds/core";
import styles from "./index.module.css";

export const Color = (): ReactElement => (
  <StackLayout>
    <Link href="#" color="primary" className={styles.linkExample}>
      Primary Link color
    </Link>
    <Link href="#" color="secondary" className={styles.linkExample}>
      Secondary Link color
    </Link>
  </StackLayout>
);
