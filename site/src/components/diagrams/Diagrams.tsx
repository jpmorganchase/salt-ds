import type { ReactNode } from "react";

import styles from "./Diagrams.module.css";

export const Diagrams = ({ children }: { children: ReactNode }) => {
  return <div className={styles.diagramsContainer}>{children}</div>;
};
