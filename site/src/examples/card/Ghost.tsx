import { Card, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Ghost = (): ReactElement => {
  return (
    <Card variant="tertiary" className={styles.variantCard}>
      <Card variant="ghost" className={styles.ghostCard}>
        <Text>Ghost Card</Text>
      </Card>
    </Card>
  );
};
