import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import megaMenuListCss from "./MegaMenuList.css";
import { useMegaMenuSection } from "./MegaMenuSectionContext";

const withBaseName = makePrefixer("saltMegaMenuList");

export interface MegaMenuListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * The links of the section, typically `MegaMenuLink` components. Each child is
   * wrapped in its own `<li>`.
   */
  children?: ReactNode;
}

export const MegaMenuList = forwardRef<HTMLUListElement, MegaMenuListProps>(
  function MegaMenuList({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-list",
      css: megaMenuListCss,
      window: targetWindow,
    });

    // Labelled by the sibling `MegaMenuHeading`, whose id is shared via the
    // section context — no child inspection on either side.
    const { headingId } = useMegaMenuSection() ?? {};

    return (
      <ul
        className={clsx(withBaseName(), className)}
        aria-labelledby={headingId}
        ref={ref}
        {...rest}
      >
        {Children.map(children, (item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: children have no stable identity
          <li key={index} className={withBaseName("item")}>
            {item}
          </li>
        ))}
      </ul>
    );
  },
);
