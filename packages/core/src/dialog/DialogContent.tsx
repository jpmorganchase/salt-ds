import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
  forwardRef,
  useState,
} from "react";
import { makePrefixer } from "../utils";

import dialogContentCss from "./DialogContent.css";

const withBaseName = makePrefixer("saltDialogContent");

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of Dialog Content
   */
  children?: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, className, ...rest } = props;
    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = (event: UIEvent<HTMLElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    };

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-content",
      css: dialogContentCss,
      window: targetWindow,
    });

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
  },
);
