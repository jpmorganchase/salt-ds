import cx from "classnames";

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
      <div className={cx("OpacityBlock-cell")}>
        <div
          className={cx("OpacityBlock-cellInner", className)}
          style={{ background: `rgba(36, 37, 38, var(${opacity}))` }}
        />
      </div>
      <code className="DocGrid-code">{cssVariable}</code>
    </>
  );
};
