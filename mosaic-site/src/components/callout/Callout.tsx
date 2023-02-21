import styles from "./Callout.module.css";

export const Callout = ({ title, children }) => {
  return (
    <div className={styles.callout}>
      <hr />
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
