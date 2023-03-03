import styles from "./UnorderedList.module.css";

export const UnorderedList = ({ children }) => (
  <ul className={styles.unorderedList}>{children}</ul>
);
