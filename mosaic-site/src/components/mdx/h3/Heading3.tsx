import { ReactNode } from "react";
import styles from "./Heading3.module.css";

export const Heading3 = ({ children }: { children: ReactNode }) => (
  <h3 className={styles.heading3}>{children}</h3>
);
