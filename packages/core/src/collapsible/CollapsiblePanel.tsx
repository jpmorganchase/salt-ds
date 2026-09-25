import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  isValidElement,
  type ReactElement,
  useEffect,
} from "react";
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

  const renderId = isValidElement<{ id?: string }>(render)
    ? render.props.id
    : undefined;
  const id = useId(idProp ?? renderId);
  const { open, setPanelId } = useCollapsibleContext();

  useEffect(() => {
    if (id) {
      setPanelId?.(id);
    }
  }, [id, setPanelId]);

  return renderProps("div", {
    className: clsx(withBaseName(), className),
    id,
    "aria-hidden": !open ? "true" : undefined,
    hidden: !open,
    ref,
    ...rest,
    render,
    children: <div className={withBaseName("inner")}>{children}</div>,
  });
});
