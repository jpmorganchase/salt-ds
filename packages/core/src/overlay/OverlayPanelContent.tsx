import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  type UIEvent,
  forwardRef,
  useState,
} from "react";
import { makePrefixer } from "../utils";
import overlayPanelContentCss from "./OverlayPanelContent.css";

const withBaseName = makePrefixer("saltOverlayPanelContent");

export interface OverlayHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Overlay Panel Content
   */
  children?: ReactNode;
}

export const OverlayPanelContent = forwardRef<
  HTMLDivElement,
  OverlayHeaderProps
>(function OverlayPanelContent(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-content",
    css: overlayPanelContentCss,
    window: targetWindow,
  });

  const { children, className, ...rest } = props;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (event: UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <>
      <div className={clsx({ [withBaseName("scroll")]: scrollTop > 0 })} />
      <div
        className={clsx(withBaseName(), className)}
        onScroll={handleScroll}
        {...rest}
        ref={ref}
      >
        {children}
      </div>
    </>
  );
});
