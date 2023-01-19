import { clsx } from "clsx";
import { CSSProperties } from "react";

import "./FontBlock.css";

export const FontSizeBlock = ({
  fontSize,
  className,
}: {
  fontSize: string;
  className?: string;
}) => {
  return (
    <>
      <div
        className={clsx("FontBlock-cell", className)}
        style={{ fontSize: `var(${fontSize})` } as CSSProperties}
      >
        T
      </div>
      <code className="DocGrid-code">{fontSize}</code>
    </>
  );
};
