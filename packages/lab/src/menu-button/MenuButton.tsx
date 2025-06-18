import type { ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef, type ReactNode, useCallback, useState } from "react";
import { CascadingMenu, type CascadingMenuProps } from "../cascading-menu";
import menuButtonCss from "./MenuButton.css";
import { MenuButtonTrigger } from "./MenuButtonTrigger";

export interface MenuButtonProps extends ButtonProps {
  CascadingMenuProps: CascadingMenuProps;
  children: ReactNode;
  className?: string;
  hideCaret?: boolean;
}

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(
    { variant = "secondary", CascadingMenuProps = {}, children, ...restProps },
    ref,
  ) {
    const {
      initialSource = { menuItems: [] },
      onOpen,
      onClose,
      ...restMenuProps
    } = CascadingMenuProps;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-button",
      css: menuButtonCss,
      window: targetWindow,
    });

    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleOpen = useCallback(() => {
      setMenuOpen(true);
      onOpen?.();
    }, [onOpen]);

    const handleClose = useCallback(() => {
      setMenuOpen(false);
      onClose?.();
    }, [onClose]);

    return (
      <CascadingMenu
        initialSource={initialSource}
        onClose={handleClose}
        onOpen={handleOpen}
        {...restMenuProps}
      >
        <MenuButtonTrigger
          aria-expanded={isMenuOpen}
          aria-haspopup
          isMenuOpen={isMenuOpen}
          ref={ref}
          variant={variant}
          {...restProps}
        >
          {children}
        </MenuButtonTrigger>
      </CascadingMenu>
    );
  },
);
