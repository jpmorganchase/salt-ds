import type { ReactNode } from "react";
import styles from "./UnorderedList.module.css";

export const UnorderedList = ({ children }: { children?: ReactNode }) => (
  <ul className={styles.unorderedList}>{children}</ul>
);
