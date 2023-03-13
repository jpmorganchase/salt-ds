import { ReactNode } from "react";
import styles from "./Heading2.module.css";

export const Heading2 = ({ children }: { children: ReactNode }) => (
  <h2 className={styles.heading2}>{children}</h2>
);
