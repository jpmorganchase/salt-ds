import { Card, Panel, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Ghost = (): ReactElement => {
  return (
    <Panel className={styles.exampleGradient}>
      <Card variant="ghost" className={styles.variantCard}>
        <Text>Ghost Card</Text>
      </Card>
    </Panel>
  );
};
