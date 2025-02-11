import type { CSSProperties } from "react";

import styles from "./CursorBlock.module.css";

/* TODO: Add cursor icons */

export const CursorBlock = ({
  cursor,
  hideToken,
}: {
  cursor: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className={styles.cell}
        style={{ cursor: `var(${cursor})` } as CSSProperties}
      />
      {!hideToken && <code>{cursor}</code>}
    </>
  );
};
