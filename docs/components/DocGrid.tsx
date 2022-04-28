import { ReactNode } from "react";
import cx from "classnames";

import "./DocGrid.css";

export const DocGrid = ({
  children,
  textExample,
}: {
  children: ReactNode;
  textExample?: boolean;
}) => {
  return (
    <div
      className={cx("uitkDocGrid", {
        ["uitkDocGrid-textExample"]: textExample,
      })}
    >
      {children}
    </div>
  );
};
