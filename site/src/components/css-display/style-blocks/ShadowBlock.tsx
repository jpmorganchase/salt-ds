import styles from "./ShadowBlock.module.css";

export const ShadowBlockCell = ({ shadowVar }: { shadowVar: string }) => {
  return (
    <div className={styles.cell} style={{ boxShadow: `var(${shadowVar})` }} />
  );
};
