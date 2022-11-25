import { ReactNode } from "react";
import cx from "classnames";

import "./ColorContainer.css";

export const ColorContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={cx("ColorContainer", className)}>{children}</div>;
};
