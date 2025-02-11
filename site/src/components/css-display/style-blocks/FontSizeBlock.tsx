import { clsx } from "clsx";
import type { CSSProperties } from "react";

import styles from "./FontBlock.module.css";

export const FontSizeBlock = ({
  fontSize,
  className,
  hideToken,
}: {
  fontSize: string;
  className?: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className={clsx(styles.cell, className)}
        style={{ fontSize: `var(${fontSize})` } as CSSProperties}
      >
        T
      </div>
      {!hideToken && <code>{fontSize}</code>}
    </>
  );
};
