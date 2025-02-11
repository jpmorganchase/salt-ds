import type { CSSProperties } from "react";

import styles from "./LetterSpacingBlock.module.css";

export const LetterSpacingBlock = ({
  letterSpacing,
  hideToken,
}: {
  letterSpacing: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className={styles.cell}
        style={{ letterSpacing: `var(${letterSpacing})` } as CSSProperties}
      >
        abc
      </div>
      {!hideToken && <code>{letterSpacing}</code>}
    </>
  );
};
