import { ComponentPropsWithoutRef } from "react";
import cx from "classnames";

import "./BackgroundBlock.css";

/** Renders a container with primary container background with padding */
export const BackgroundBlock = ({
  className,
  ...restProps
}: ComponentPropsWithoutRef<"div">) => {
  return <div className={cx("BackgroundBlock", className)} {...restProps} />;
};
