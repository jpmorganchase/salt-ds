import React, {
  memo,
  forwardRef,
  HTMLAttributes,
  useMemo,
  PropsWithoutRef,
  useCallback,
  useState,
} from "react";
import classnames from "classnames";
import { Button, ButtonProps } from "@jpmorganchase/uitk-core";
import { OverflowMenuIcon } from "@jpmorganchase/icons";
import {
  OverflowPanel,
  OverflowPanelProps,
  // OverflowPanelProps as OverflowPanelPropsType,
} from "../overflow-panel";

export type OverflowButtonProps = PropsWithoutRef<ButtonProps> & {
  align?: "start" | "end";
};
export interface OverflowMenuProps extends HTMLAttributes<HTMLElement> {
  onItemClick?: OverflowPanelProps["onItemClick"];
  orientation?: string;
  overflowButtonIcon?: any;
  overflowButtonLabel?: string;
  OverflowButtonProps?: Partial<OverflowButtonProps>;
  OverflowPanelProps?: Partial<OverflowPanelProps>;
  menuItems: React.ReactElement[];
}

const noop = () => undefined;

const OverflowMenu = forwardRef<HTMLDivElement, OverflowMenuProps>(
  function OverflowMenu(props, ref) {
    const {
      OverflowButtonProps = {},
      OverflowPanelProps = {},
      className,
      overflowButtonLabel,
      overflowButtonIcon,
      orientation,
      onKeyDown,
      onItemClick,
      menuItems,
    } = props;

    const MenuProps: Partial<OverflowPanelProps> = useMemo(
      () => ({
        ...OverflowPanelProps,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onItemClick: ({ id }) => onItemClick(id),
        onKeyDown,
        rootPlacement:
          orientation === "horizontal" ? "bottom-end" : "right-start",
      }),
      [OverflowPanelProps, onItemClick, onKeyDown, orientation]
    );

    const [isMenuOpen, setMenuOpen] = useState(false);

    // TODO memoise ?
    const getContent = () => {
      if (overflowButtonIcon) {
        return overflowButtonIcon;
      } else if (overflowButtonLabel) {
        return overflowButtonLabel;
      } else {
        return <OverflowMenuIcon />;
      }
    };

    //TODO merge this with the memo above
    const { onOpen = noop, onClose = noop, ...restMenuProps } = MenuProps;

    const handleOpen = useCallback(() => {
      setMenuOpen(true);
      onOpen();
    }, [onOpen]);

    const handleClose = useCallback(() => {
      setMenuOpen(false);
      onClose();
    }, [onClose]);

    // We use the source.length as the key because MenuButton (CascadingMenu) currently only
    // supports uncontrolled behaviour - meaning we cannot initially render the button without
    // a source.
    return (
      <div className={className} ref={ref}>
        <OverflowPanel
          {...restMenuProps}
          menuItems={menuItems}
          onClose={handleClose}
          onOpen={handleOpen}
        >
          <Button
            aria-expanded={isMenuOpen}
            aria-haspopup
            className={classnames("uitkOverflowButton", className, {
              "uitkOverflowButton-buttonOpen": isMenuOpen,
              "uitkOverflowButton-overflowButtonWithLabel":
                !!overflowButtonLabel,
            })}
            // ref={ref}
            tabIndex={0}
            variant="secondary"
            {...OverflowButtonProps}
          >
            {getContent()}
          </Button>
        </OverflowPanel>
      </div>
    );
  }
);

export default memo(OverflowMenu);
