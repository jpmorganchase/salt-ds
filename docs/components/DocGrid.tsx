import { ReactNode } from "react";

import "./DocGrid.css";

export const DocGrid = ({ children }: { children: ReactNode }) => {
  return <div className="uitkDocGrid">{children}</div>;
};
