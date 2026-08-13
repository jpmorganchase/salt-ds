import { Link, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Color = (): ReactElement => (
  <StackLayout align="start">
    <Link
      href="/salt/foundations/data-visualization/color-and-pattern"
      color="accent"
      className={styles.linkExample}
    >
      Read color guidance
    </Link>
    <Link
      href="/salt/components/button"
      color="primary"
      className={styles.linkExample}
    >
      View button documentation
    </Link>
    <Link
      href="/salt/about/supported-platforms"
      color="secondary"
      className={styles.linkExample}
    >
      View supported platforms
    </Link>
    <Text color="error">
      <Link
        href="/salt/components/form-field/accessibility"
        color="inherit"
        className={styles.linkExample}
      >
        Review validation guidance
      </Link>
    </Text>
  </StackLayout>
);
