import { clsx } from "clsx";
import { CSSProperties } from "react";

import "./FontBlock.css";

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
        className={clsx("FontBlock-cell", className)}
        style={{ fontSize: `var(${fontSize})` } as CSSProperties}
      >
        T
      </div>
      {!hideToken && <code className="DocGrid-code">{fontSize}</code>}
    </>
  );
};
