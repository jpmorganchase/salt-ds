import { Card, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Variants = (): ReactElement => {
  return (
    <StackLayout direction="row">
      <Card variant="primary" className={styles.variantCard}>
        <Text style={{ margin: "auto" }}>Primary</Text>
      </Card>
      <Card variant="secondary" className={styles.variantCard}>
        Secondary
      </Card>
    </StackLayout>
  );
};
