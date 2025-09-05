import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { makePrefixer, useId } from "../utils";

import { useCollapsibleContext } from "./CollapsibleContext";
import collapsiblePanelCss from "./CollapsiblePanel.css";

export interface CollapsiblePanelProps
  extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCollapsiblePanel");

export const CollapsiblePanel = forwardRef<
  HTMLDivElement,
  CollapsiblePanelProps
>((props, ref) => {
  const { children, className, id: idProp, ...rest } = props;

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

  return (
    <div
      className={clsx(withBaseName(), className)}
      id={id}
      aria-hidden={!open ? "true" : undefined}
      hidden={!open}
      ref={ref}
      {...rest}
    >
      <div className={withBaseName("inner")}>{children}</div>
    </div>
  );
});
