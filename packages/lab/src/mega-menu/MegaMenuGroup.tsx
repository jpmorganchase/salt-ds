import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import megaMenuGroupCss from "./MegaMenuGroup.css";
import { MegaMenuGroupContext } from "./MegaMenuGroupContext";

const withBaseName = makePrefixer("saltMegaMenuGroup");

export interface MegaMenuGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu group: a `MegaMenuGroupHeading` and a
   * `MegaMenuList` of `MegaMenuListItem`s.
   */
  children?: ReactNode;
}

export const MegaMenuGroup = forwardRef<HTMLDivElement, MegaMenuGroupProps>(
  function MegaMenuGroup({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-group",
      css: megaMenuGroupCss,
      window: targetWindow,
    });

    // The heading registers its id so the list can label itself; `undefined`
    // with no heading. The group is also a navigation column.
    const [headingId, setHeadingId] = useState<string | undefined>(undefined);
    const contextValue = useMemo(
      () => ({ headingId, setHeadingId }),
      [headingId],
    );

    return (
      <MegaMenuGroupContext.Provider value={contextValue}>
        <div
          data-mega-menu-column=""
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </MegaMenuGroupContext.Provider>
    );
  },
);
