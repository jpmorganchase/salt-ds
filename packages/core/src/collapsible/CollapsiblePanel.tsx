import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  useEffect,
} from "react";
import type { DataAttributes } from "../types";
import { makePrefixer, renderProps, useId } from "../utils";

import { useCollapsibleContext } from "./CollapsibleContext";
import collapsiblePanelCss from "./CollapsiblePanel.css";

export interface CollapsiblePanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Element used to customize the panel's root.
   */
  render?: ReactElement;
}

const withBaseName = makePrefixer("saltCollapsiblePanel");

export const CollapsiblePanel = forwardRef<
  HTMLDivElement,
  CollapsiblePanelProps
>((props, ref) => {
  const { children, className, id: idProp, render, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-collapsible-panel",
    css: collapsiblePanelCss,
    window: targetWindow,
  });

  const id = useId(idProp);
  const { open, setPanelId } = useCollapsibleContext();

  useEffect(() => {
    if (id) {
      setPanelId?.(id);
    }
  }, [id, setPanelId]);

  const stateAttributes: Partial<DataAttributes> = {
    "data-open": open ? "" : undefined,
    "data-closed": !open ? "" : undefined,
  };

  return renderProps("div", {
    className: clsx(withBaseName(), className),
    id,
    "aria-hidden": !open ? "true" : undefined,
    hidden: !open,
    ref,
    ...rest,
    ...stateAttributes,
    render,
    children: <div className={withBaseName("inner")}>{children}</div>,
  });
});
