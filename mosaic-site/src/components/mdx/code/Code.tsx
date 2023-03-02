import styles from "./Code.module.css";

export const Code = ({ children }) => (
  <code className={styles.code}>{children}</code>
);
