import { Card, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Variants = (): ReactElement => {
  return (
    <GridLayout
      columns="repeat(auto-fill, 260px)"
      className={styles.variantContainer}
    >
      <Card variant="primary" className={styles.variantCard}>
        Primary
      </Card>
      <Card variant="secondary" className={styles.variantCard}>
        Secondary
      </Card>
      <Card variant="tertiary" className={styles.variantCard}>
        Tertiary
      </Card>
    </GridLayout>
  );
};
