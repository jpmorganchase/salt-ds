import { ReactNode } from "react";
import "./ColumnLayout.css";

export const ColumnLayoutContainer = ({
  children,
}: {
  children?: ReactNode;
}) => <div className="uitkColumnLayout-container">{children}</div>;

export const ColumnLayoutItem = ({ children }: { children?: ReactNode }) => (
  <div className="uitkColumnLayout-item">{children}</div>
);
