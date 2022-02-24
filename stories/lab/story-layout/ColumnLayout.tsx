import { FC } from "react";
import "./ColumnLayout.css";

export const ColumnLayoutContainer: FC = (props) => (
  <div className="uitkColumnLayout-container">{props.children}</div>
);

export const ColumnLayoutItem: FC = (props) => (
  <div className="uitkColumnLayout-item">{props.children}</div>
);
