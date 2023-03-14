import { ReactNode } from "react";
import styles from "./Heading4.module.css";

export const Heading4 = ({ children }: { children: ReactNode }) => (
  <h4 className={styles.heading4}>{children}</h4>
);
