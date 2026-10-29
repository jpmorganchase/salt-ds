import { Card, GridLayout, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Variants = (): ReactElement => {
  return (
    <StackLayout className={styles.variantContainer}>
      <GridLayout
        columns="repeat(auto-fill, 260px)"
        className={styles.variantContainer}
      >
        <Card variant="primary" className={styles.variantCard}>
          <Text as="p">Primary</Text>
        </Card>
        <Card variant="secondary" className={styles.variantCard}>
          <Text as="p">Secondary</Text>
        </Card>
        <Card variant="tertiary" className={styles.variantCard}>
          <Text as="p">Tertiary</Text>
        </Card>
      </GridLayout>
    </StackLayout>
  );
};
