import "./Cursor.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridCursor");

export interface CursorProps {}

// This is probably obsolete. Cursor is rendered using cell borders now.
export function Cursor(props: CursorProps) {
  return <div className={withBaseName()} />;
}
