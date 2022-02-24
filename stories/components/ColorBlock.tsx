import cx from "classnames";

import "./ColorBlock.css";

export const ColorBlock = ({ colorVar }: { colorVar: string }) => {
  return (
    <>
      <div className={cx("ColorBlock-cell")}>
        <div
          className={cx("ColorBlock-cellInner")}
          style={{ background: `var(${colorVar})` }}
        />
      </div>
      <code className="DocGrid-code">{colorVar}</code>
    </>
  );
};
