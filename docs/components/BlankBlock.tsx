import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import "./BlankBlock.css";

export const BlankBlockCell = (props: ComponentPropsWithoutRef<"div">) => {
  return <div className={clsx("BlankBlock-cell")} {...props} />;
};

export const BlankBlockCode = ({ children }: { children: ReactNode }) => {
  return <code className="DocGrid-code">{children}</code>;
};
