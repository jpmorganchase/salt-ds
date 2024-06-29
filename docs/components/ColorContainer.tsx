import { clsx } from "clsx";
import type { ReactNode } from "react";

import "./ColorContainer.css";

export const ColorContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={clsx("ColorContainer", className)}>{children}</div>;
};
