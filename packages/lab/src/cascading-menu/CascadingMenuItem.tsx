import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  KeyboardEvent,
} from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { ChevronRightIcon } from "@brandname/icons";

import { MenuDescriptor } from "./CascadingMenuProps";
import { ListItem, ListItemProps } from "../list";
import { Tooltip } from "../tooltip";

import "./CascadingMenuItem.css";

const noop = () => undefined;
const withBaseName = makePrefixer("uitkMenuItem");

const getIcon = (sourceItem: MenuDescriptor, isDisabled = false) => {
  const CustomIcon = sourceItem.icon;
  if (CustomIcon) {
    return (
      <CustomIcon
        className={classnames(withBaseName("menuItemStartAdornment"), {
          [withBaseName("menuItemDisabled")]: isDisabled,
        })}
        size={12}
      />
    );
  } else {
    return null;
  }
};

function useControlledTooltip(
  predicate: () => boolean,
  isNavigatingWithKeyboard: boolean,
  tooltipEnterDelay: number,
  tooltipLeaveDelay: number
) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipKeyboardTimer = useRef<number>();
  const tooltipMouseHoverTimer = useRef<number>();
  const tooltipMouseLeaveTimer = useRef<number>();
  const clearTimeouts = () => {
    clearTimeout(tooltipKeyboardTimer.current);
    clearTimeout(tooltipMouseHoverTimer.current);
    clearTimeout(tooltipMouseLeaveTimer.current);
  };
  useEffect(() => () => clearTimeouts(), []);

  // TODO This is not concurrent mode safe due to writing to a ref during render.
  if (isNavigatingWithKeyboard) {
    if (predicate()) {
      clearTimeouts();
      if (tooltipEnterDelay) {
        tooltipKeyboardTimer.current = window.setTimeout(() => {
          setTooltipOpen(true);
        }, tooltipEnterDelay);
      } else {
        setTooltipOpen(true);
      }
    } else {
      clearTimeouts();
      if (tooltipOpen) {
        setTooltipOpen(false);
      }
    }
  }

  const onMouseOver = useCallback(() => {
    clearTimeouts();
    if (tooltipEnterDelay) {
      tooltipMouseHoverTimer.current = window.setTimeout(() => {
        setTooltipOpen(true);
      }, tooltipEnterDelay);
    } else {
      setTooltipOpen(true);
    }
  }, [tooltipEnterDelay]);

  const onMouseLeave = useCallback(() => {
    clearTimeouts();
    if (tooltipLeaveDelay) {
      tooltipMouseLeaveTimer.current = window.setTimeout(() => {
        setTooltipOpen(false);
      }, tooltipLeaveDelay);
    } else {
      setTooltipOpen(false);
    }
  }, [tooltipLeaveDelay]);

  return {
    open: tooltipOpen,
    onMouseOver,
    onMouseLeave,
  };
}

export interface MenuItemProps extends ListItemProps<MenuDescriptor> {
  blurSelected: boolean;
  className?: string;
  hasEndAdornment: boolean;
  hasScrollbar: boolean;
  hasStartAdornment: boolean;
  hasSubMenu: boolean;
  isInteracted: boolean;
  isChildMenuOpen: boolean;
  isNavigatingWithKeyboard: boolean;
  itemToString: Required<ListItemProps<MenuDescriptor>>["itemToString"];
  onItemClick?: (
    sourceItem: MenuDescriptor,
    event: MouseEvent | KeyboardEvent
  ) => void;
  sourceItem: MenuDescriptor;
  tooltipEnterDelay: number;
  tooltipLeaveDelay: number;
}

export const DefaultMenuItem = forwardRef<HTMLElement, MenuItemProps>(function (
  props,
  ref
) {
  const {
    blurSelected,
    className,
    hasEndAdornment,
    hasScrollbar,
    hasStartAdornment,
    onItemClick,
    itemToString,
    isInteracted,
    isNavigatingWithKeyboard,
    isChildMenuOpen,
    hasSubMenu,
    sourceItem,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    ...restProps
  } = props;

  const menuTextRef = useRef<HTMLDivElement>(null);
  const [hasTooltip, setHasTooltip] = useState(false);
  const menuText = itemToString(sourceItem);

  useEffect(() => {
    const element = menuTextRef.current;
    if (element) {
      if (element.offsetWidth < element.scrollWidth) {
        setHasTooltip(true);
      }
    }
  }, [menuText]);

  const { open, ...tooltipMouseListeners } = useControlledTooltip(
    () => isInteracted && !isChildMenuOpen,
    isNavigatingWithKeyboard,
    tooltipEnterDelay,
    tooltipLeaveDelay
  );
  const isDisabled = sourceItem.disabled;
  const divider = sourceItem.divider;

  const onClick = isDisabled || hasSubMenu ? noop : onItemClick;

  const handleOnClick = (event: MouseEvent) => {
    if (!isDisabled && !hasSubMenu) {
      onClick?.(sourceItem, event);
    }
  };
  const interactionClasses = isNavigatingWithKeyboard
    ? {
        [withBaseName(`menuItemKeyboardActive`)]:
          !isDisabled && isInteracted && !blurSelected,
        [withBaseName(`menuItemKeyboardDisabled`)]: isDisabled && isInteracted,
      }
    : {
        [withBaseName(`menuItemHover`)]: !isDisabled && !blurSelected,
      };

  const icon = hasStartAdornment ? getIcon(sourceItem, isDisabled) : null;

  const content = (contentProps: any) => (
    <ListItem
      {...restProps}
      aria-expanded={isChildMenuOpen || undefined}
      className={classnames(
        withBaseName(),
        {
          [withBaseName("menuItemDivider")]: divider,
          [withBaseName("menuItemBlurSelected")]: blurSelected,
          [withBaseName("menuItemSelected")]:
            !isDisabled && !hasSubMenu && isInteracted,
          ...interactionClasses,
          [withBaseName("menuItemWithScrollbar")]: hasScrollbar,
        },
        className
      )}
      disabled={isDisabled}
      item={sourceItem}
      // TODO highlightProps - see original code?
      {...contentProps}
      onClick={handleOnClick}
      ref={ref}
      role="menuitem"
    >
      {hasStartAdornment && (
        <div className={withBaseName("menuItemStartAdornmentContainer")}>
          {icon}
        </div>
      )}
      <div
        className={classnames(withBaseName("menuItemText"), {
          [withBaseName("menuItemDisabled")]: isDisabled,
        })}
        ref={menuTextRef}
      >
        {menuText}
      </div>
      {hasEndAdornment && (
        <div
          className={classnames(withBaseName("menuItemEndAdornmentContainer"), {
            [withBaseName("menuItemAdornmentHidden")]: !hasSubMenu,
          })}
        >
          <ChevronRightIcon
            className={classnames(withBaseName("menuItemEndAdornment"), {
              [withBaseName("menuItemDisabled")]: isDisabled,
            })}
            size={12}
          />
        </div>
      )}
      {divider && <div role="separator" />}
    </ListItem>
  );
  return hasTooltip ? (
    <Tooltip
      disableFocusListener
      disableHoverListener
      enterDelay={tooltipEnterDelay}
      leaveDelay={tooltipLeaveDelay}
      open={open}
      placement="top"
      title={sourceItem.tooltip || menuText}
    >
      {content(tooltipMouseListeners)}
    </Tooltip>
  ) : (
    content({})
  );
});
