import "./Cursor.css";
import { makePrefixer } from "@salt-ds/core";

const withBaseName = makePrefixer("saltGridCursor");

export interface CursorProps {}

// This is probably obsolete. Cursor is rendered using cell borders now.
export function Cursor(props: CursorProps) {
  return <div className={withBaseName()} />;
}
