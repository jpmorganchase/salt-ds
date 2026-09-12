import { Card } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Default = (): ReactElement => {
  return <Card className={styles.variantCard}>Card content</Card>;
};
