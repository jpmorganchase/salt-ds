import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useEffect } from "react";

import { useCollapsibleContext } from "./CollapsibleContext";
import collapsiblePanelCss from "./CollapsiblePanel.css";

export interface CollapsiblePanelProps
  extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCollapsiblePanel");

export const CollapsiblePanel = (props: CollapsiblePanelProps) => {
  const { children, className, id: idProp, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-collapsible-panel",
    css: collapsiblePanelCss,
    window: targetWindow,
  });

  const id = useId(idProp);
  const { expanded, setPanelId } = useCollapsibleContext();

  useEffect(() => {
    if (id) {
      setPanelId?.(id);
    }
  }, [id, setPanelId]);

  return (
    <div
      className={clsx(withBaseName(), className)}
      id={id}
      aria-hidden={!expanded ? "true" : undefined}
      hidden={!expanded}
      {...rest}
    >
      <div className={withBaseName("inner")}>{children}</div>
    </div>
  );
};
