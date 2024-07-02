import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type CalloutProps = { title: string; children: ReactNode };

export const Callout = ({ title, children }: CalloutProps) => {
  return (
    <div className={styles.callout}>
      <hr />
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
