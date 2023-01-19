import { ReactNode } from "react";
import { clsx } from "clsx";

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
      className={clsx("saltDocGrid", className, {
        ["saltDocGrid-textExample"]: textExample,
      })}
    >
      {children}
    </div>
  );
};
