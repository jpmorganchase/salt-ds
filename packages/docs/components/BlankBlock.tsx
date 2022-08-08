import { ComponentPropsWithoutRef, ReactNode } from "react";
import cx from "classnames";

import "./BlankBlock.css";

export const BlankBlockCell = (props: ComponentPropsWithoutRef<"div">) => {
  return <div className={cx("BlankBlock-cell")} {...props} />;
};

export const BlankBlockCode = ({ children }: { children: ReactNode }) => {
  return <code className="DocGrid-code">{children}</code>;
};
