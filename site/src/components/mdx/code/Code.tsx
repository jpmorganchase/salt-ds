import type { ReactNode } from "react";
import styles from "./Code.module.css";

export const Code = ({ children }: { children?: ReactNode }) => (
  <code className={styles.code}>{children}</code>
);
