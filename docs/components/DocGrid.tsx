import { ReactNode } from "react";
import cx from "classnames";

import "./DocGrid.css";

export const DocGrid = ({
  children,
  className,
  textExample,
}: {
  children: ReactNode;
  className?: string;
  textExample?: boolean;
}) => {
  return (
    <div
      className={cx("uitkDocGrid", className, {
        ["uitkDocGrid-textExample"]: textExample,
      })}
    >
      {children}
    </div>
  );
};
