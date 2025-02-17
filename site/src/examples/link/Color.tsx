import { Link, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Color = (): ReactElement => (
  <StackLayout>
    <Link href="#" color="accent" className={styles.linkExample}>
      Accent Link color
    </Link>
    <Link href="#" color="primary" className={styles.linkExample}>
      Primary Link color
    </Link>
    <Link href="#" color="secondary" className={styles.linkExample}>
      Secondary Link color
    </Link>
    <Text color="error">
      <Link href="#" color="inherit" className={styles.linkExample}>
        Inherit Link color
      </Link>
    </Text>
  </StackLayout>
);
