import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import CursorCss from "./Cursor.css";

const withBaseName = makePrefixer("saltGridCursor");

export interface CursorProps {}

// This is probably obsolete. Cursor is rendered using cell borders now.
export function Cursor(props: CursorProps) {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-cursor",
    css: CursorCss,
    window: targetWindow,
  });

  return <div className={withBaseName()} />;
}
