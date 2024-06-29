import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import cursorCss from "./Cursor.css";

const withBaseName = makePrefixer("saltGridCursor");

export type CursorProps = {};

// This is probably obsolete. Cursor is rendered using cell borders now.
export function Cursor(props: CursorProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-cursor",
    css: cursorCss,
    window: targetWindow,
  });

  return <div className={withBaseName()} />;
}
