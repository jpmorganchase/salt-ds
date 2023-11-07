import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import menuItemCss from "./MenuItem.css";
import { useMenuContext } from "./MenuContext";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useMenuTriggerContext } from "./MenuTriggerContext";

export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltMenuItem");

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const { children, className, id: idProp, ...rest } = props;

    const { refs, setActive } = useMenuContext();
    const isSubmenuTrigger = useMenuTriggerContext();
    const id = useId(idProp);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-item",
      css: menuItemCss,
      window: targetWindow,
    });

    const handleRef = useForkRef(refs.setFloating, ref);

    const handleMouseOver = () => {
      setActive(id);
    };

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={handleRef}
        role="menuitem"
        onMouseOver={handleMouseOver}
        {...rest}
      >
        {children}
        {isSubmenuTrigger && (
          <ChevronRightIcon className={withBaseName("expandIcon")} />
        )}
      </div>
    );
  }
);
