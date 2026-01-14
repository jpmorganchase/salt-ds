import { Text } from "@salt-ds/core";
import type { ReactNode } from "react";
import styles from "./Paragraph.module.css";

export const Paragraph = ({ children }: { children?: ReactNode }) => (
  <Text as="p" className={styles.paragraph}>
    {children}
  </Text>
);
