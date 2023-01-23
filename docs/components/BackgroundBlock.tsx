import { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import "./BackgroundBlock.css";

/** Renders a container with primary container background with padding */
export const BackgroundBlock = ({
  className,
  ...restProps
}: ComponentPropsWithoutRef<"div">) => {
  return <div className={clsx("BackgroundBlock", className)} {...restProps} />;
};
