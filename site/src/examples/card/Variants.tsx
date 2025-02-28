import { Card, GridLayout, Panel, StackLayout } from "@salt-ds/core";
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
          Primary
        </Card>
        <Card variant="secondary" className={styles.variantCard}>
          Secondary
        </Card>
        <Card variant="tertiary" className={styles.variantCard}>
          Tertiary
        </Card>
      </GridLayout>
      <GridLayout
        columns="repeat(auto-fill, 260px)"
        className={styles.variantContainer}
      >
        <Panel variant="primary">
          <Card variant="alpha" className={styles.alphaCard}>
            Alpha
          </Card>
        </Panel>
        <Panel variant="secondary">
          <Card variant="alpha" className={styles.alphaCard}>
            Alpha
          </Card>
        </Panel>
        <Panel variant="tertiary">
          <Card variant="alpha" className={styles.alphaCard}>
            Alpha
          </Card>
        </Panel>
      </GridLayout>
    </StackLayout>
  );
};
