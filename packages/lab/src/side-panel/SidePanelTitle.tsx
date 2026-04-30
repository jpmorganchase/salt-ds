import { makePrefixer, useId, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { useSidePanelContext } from "./internal";
import sidePanelHeaderCss from "./SidePanelHeader.css";

const withBaseName = makePrefixer("saltSidePanelTitle");

export interface SidePanelTitleProps extends ComponentPropsWithRef<"div"> {}

export const SidePanelTitle = forwardRef<HTMLDivElement, SidePanelTitleProps>(
  function SidePanelTitle(props, ref) {
    const { children, className, id: idProp, ...rest } = props;

    const { setHeaderId, headerId: contextHeaderId } = useSidePanelContext();
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel-header",
      css: sidePanelHeaderCss,
      window: targetWindow,
    });

    const headerId = useId(contextHeaderId ?? idProp);

    useIsomorphicLayoutEffect(() => {
      if (headerId) {
        setHeaderId(headerId);
      }

      return () => {
        setHeaderId(undefined);
      };
    }, [headerId, setHeaderId]);

    return (
      <div
        ref={ref}
        id={headerId}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
