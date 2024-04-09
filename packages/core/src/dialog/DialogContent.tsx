import { forwardRef, HTMLAttributes, ReactNode, useState } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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

    const handleScroll = (event: React.UIEvent<HTMLElement>) => {
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
  }
);
