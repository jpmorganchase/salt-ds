import { clsx } from "clsx";
import type { ReactNode } from "react";

import "./DocGrid.css";

export const DocGrid = ({
  children,
  className,
  textExample,
  withNotes,
}: {
  children: ReactNode;
  className?: string;
  withNotes?: boolean;
  textExample?: boolean;
}) => {
  return (
    <div
      className={clsx("saltDocGrid", className, {
        "saltDocGrid-textExample": textExample,
        "saltDocGrid-withNotes": withNotes,
      })}
    >
      {children}
    </div>
  );
};
