import { Card, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Default = (): ReactElement => {
  return (
    <Card className={styles.variantCard}>
      <Text as="p">Card content</Text>
    </Card>
  );
};
