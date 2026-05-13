import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, useRef } from "react";
import { useIsScrollable, useSidePanelContext } from "./internal";
import sidePanelContentCss from "./SidePanelContent.css";

const withBaseName = makePrefixer("saltSidePanelContent");

export interface SidePanelContentProps extends ComponentPropsWithRef<"div"> {}

export const SidePanelContent = forwardRef<
  HTMLDivElement,
  SidePanelContentProps
>(function SidePanelContent(props, ref) {
  const {
    children,
    className,
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const { titleId } = useSidePanelContext();
  const targetWindow = useWindow();
  const contentSuffixId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const isScrollable = useIsScrollable(bodyRef);

  useComponentCssInjection({
    testId: "salt-side-panel-content",
    css: sidePanelContentCss,
    window: targetWindow,
  });

  const explicitLabelledBy = ariaLabelledBy;
  const explicitLabel = ariaLabel;

  let bodyAriaLabelledBy: string | undefined;
  let bodyAriaLabel: string | undefined;

  if (isScrollable) {
    if (explicitLabelledBy) {
      bodyAriaLabelledBy = explicitLabelledBy;
    } else if (titleId) {
      bodyAriaLabelledBy = clsx(titleId, contentSuffixId) || undefined;
    } else {
      bodyAriaLabel = explicitLabel ?? "Content";
    }
  }

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      {isScrollable ? (
        <span id={contentSuffixId} hidden>
          content
        </span>
      ) : null}
      <div
        ref={bodyRef}
        className={withBaseName("body")}
        {...(isScrollable && {
          role: "region",
          tabIndex: 0,
          "aria-labelledby": bodyAriaLabelledBy,
          "aria-label": bodyAriaLabel,
        })}
      >
        {children}
      </div>
    </div>
  );
});
