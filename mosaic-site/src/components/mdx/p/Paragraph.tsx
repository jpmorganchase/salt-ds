import styles from "./Paragraph.module.css";

export const Paragraph = ({ children }) => (
  <p className={styles.paragraph}>{children}</p>
);
