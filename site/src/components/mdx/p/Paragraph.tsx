import type { ReactNode } from "react";
import styles from "./Paragraph.module.css";

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <p className={styles.paragraph}>{children}</p>
);
