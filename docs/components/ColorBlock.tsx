import cx from "classnames";

import "./ColorBlock.css";

export const ColorBlock = ({
  colorVar,
  className,
}: {
  colorVar: string;
  className?: string;
}) => {
  return (
    <>
      <div className={cx("ColorBlock-cell")}>
        <div
          className={cx("ColorBlock-cellInner", className)}
          style={{ background: `var(${colorVar})` }}
        />
      </div>
      <code className="DocGrid-code">{colorVar}</code>
    </>
  );
};
