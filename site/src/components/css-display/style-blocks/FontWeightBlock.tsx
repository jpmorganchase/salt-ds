import type { CSSProperties } from "react";

import styles from "./FontBlock.module.css";

export const FontWeightBlock = ({
  fontWeight,
  hideToken,
}: {
  fontWeight: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className={styles.cell}
        style={{ fontWeight: `var(${fontWeight})` } as CSSProperties}
      >
        T
      </div>
      {!hideToken && <code>{fontWeight}</code>}
    </>
  );
};
