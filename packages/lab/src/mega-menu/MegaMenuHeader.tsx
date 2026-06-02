import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useContext,
} from "react";
import { MegaMenuGroupContext } from "./MegaMenuGroupContext";
import megaMenuHeaderCss from "./MegaMenuHeader.css";

const withBaseName = makePrefixer("saltMegaMenuHeader");

export interface MegaMenuHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu header.
   */
  children?: ReactNode;
}

export const MegaMenuHeader = forwardRef<HTMLDivElement, MegaMenuHeaderProps>(
  function MegaMenuHeader({ children, className, id: idProp, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-header",
      css: megaMenuHeaderCss,
      window: targetWindow,
    });

    // Inside a group, the header is labelled by the group-provided id so its
    // list can reference it via aria-labelledby; standalone, an explicit id wins.
    const groupContext = useContext(MegaMenuGroupContext);
    const id = groupContext?.headerId ?? idProp;

    return (
      <div
        className={clsx(withBaseName(), className)}
        id={id}
        ref={ref}
        {...rest}
      >
        <div className={clsx(withBaseName("content"))}>{children}</div>
      </div>
    );
  },
);
