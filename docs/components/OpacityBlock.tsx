import { clsx } from "clsx";

import "./OpacityBlock.css";

export const OpacityBlock = ({
  opacity,
  cssVariable,
  className,
}: {
  opacity: string;
  className?: string;
  cssVariable: string;
}) => {
  return (
    <>
      <div className={clsx("OpacityBlock-cell")}>
        <div
          className={clsx("OpacityBlock-cellInner", className)}
          style={{ background: `rgba(36, 37, 38, var(${opacity}))` }}
        />
      </div>
      <code className="DocGrid-code">{cssVariable}</code>
    </>
  );
};
