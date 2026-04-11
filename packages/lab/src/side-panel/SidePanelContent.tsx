import { Button, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";
import sidePanelContentCss from "./SidePanelContent.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanelContent");

export interface SidePanelContentProps extends ComponentPropsWithRef<"div"> {
  /**
   * Content rendered in the header area next to the close button.
   */
  header?: ReactNode;
  /**
   * Accessible label for the scrollable body region.
   * If provided, the body is rendered as an accessible `role="region"` with `aria-label`.
   */
  "aria-label"?: string;
}

export const SidePanelContent = forwardRef<
  HTMLDivElement,
  SidePanelContentProps
>(function SidePanelContent(props, ref) {
  const {
    header,
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-side-panel-content",
    css: sidePanelContentCss,
    window: targetWindow,
  });

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      <div className={withBaseName("header")}>
        {header}
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
      <div
        className={withBaseName("body")}
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        tabIndex={ariaLabel ? 0 : undefined}
      >
        {children}
      </div>
    </div>
  );
});
