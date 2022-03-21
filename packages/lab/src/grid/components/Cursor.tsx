import { FC } from "react";
import "./Cursor.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridCursor");

export interface CursorProps {}

export const Cursor: FC<CursorProps> = function Cursor(props) {
  return <div className={withBaseName()} />;
};
