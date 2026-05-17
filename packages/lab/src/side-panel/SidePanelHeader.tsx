import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import sidePanelHeaderCss from "./SidePanelHeader.css";

const withBaseName = makePrefixer("saltSidePanelHeader");

export type SidePanelHeaderProps = ComponentPropsWithRef<"div">;

export const SidePanelHeader = forwardRef<HTMLDivElement, SidePanelHeaderProps>(
  function SidePanelHeader(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel-header",
      css: sidePanelHeaderCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {children}
      </div>
    );
  },
);
