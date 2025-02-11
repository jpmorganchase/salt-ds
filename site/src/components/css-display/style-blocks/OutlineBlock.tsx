import styles from "./OutlineBlock.module.css";

export const OutlineBlock = ({ outline }: { outline: string }) => {
  return (
    <div
      className={styles.cell}
      style={{
        outline: `var(${outline})`,
      }}
    />
  );
};
