import { clsx } from "clsx";

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
      <div className={clsx("ColorBlock-cell")}>
        <div
          className={clsx("ColorBlock-cellInner", className)}
          style={{ background: `var(${colorVar})` }}
        />
      </div>
      <code className="DocGrid-code">{colorVar}</code>
    </>
  );
};
