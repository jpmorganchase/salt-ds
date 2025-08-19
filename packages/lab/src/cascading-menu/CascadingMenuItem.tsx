import { makePrefixer, Tooltip, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ListItem, type ListItemProps } from "../list-deprecated";
import cascadingMenuItemCss from "./CascadingMenuItem.css";
import type { MenuDescriptor } from "./CascadingMenuProps";

const noop = () => undefined;
const withBaseName = makePrefixer("saltCascadingMenuItem");

const getIcon = (sourceItem: MenuDescriptor, isDisabled = false) => {
  const CustomIcon = sourceItem.icon;
  if (CustomIcon) {
    return (
      <CustomIcon
        className={clsx(withBaseName("menuItemStartAdornment"), {
          [withBaseName("menuItemDisabled")]: isDisabled,
        })}
      />
    );
  }
  return null;
};

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
    event: MouseEvent | KeyboardEvent,
  ) => void;
  sourceItem: MenuDescriptor;
  tooltipEnterDelay: number;
  tooltipLeaveDelay: number;
}

export const DefaultMenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (props, ref) => {
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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-cascading-menu-item",
      css: cascadingMenuItemCss,
      window: targetWindow,
    });
    const { ExpandGroupIcon } = useIcon();
    const menuTextRef = useRef<HTMLDivElement>(null);
    const [hasTooltip, setHasTooltip] = useState(false);
    const menuText = itemToString(sourceItem);

    useEffect(() => {
      const element = menuTextRef.current;
      if (element && menuText != null) {
        setHasTooltip(element.offsetWidth < element.scrollWidth);
      }
    }, [menuText]);

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
          [withBaseName("menuItemKeyboardActive")]:
            !isDisabled && isInteracted && !blurSelected,
          [withBaseName("menuItemKeyboardDisabled")]:
            isDisabled && isInteracted,
        }
      : {
          [withBaseName("menuItemHover")]: !isDisabled && !blurSelected,
        };

    const icon = hasStartAdornment ? getIcon(sourceItem, isDisabled) : null;
    const tooltipTitle = sourceItem.tooltip || menuText;

    return (
      <Tooltip
        disableFocusListener
        disableHoverListener
        enterDelay={tooltipEnterDelay}
        leaveDelay={tooltipLeaveDelay}
        placement="top"
        disabled={!tooltipTitle || !hasTooltip || isChildMenuOpen}
        content={tooltipTitle}
      >
        <ListItem
          ref={ref}
          aria-expanded={isChildMenuOpen || undefined}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("menuItemDivider")]: divider,
              [withBaseName("menuItemBlurSelected")]: blurSelected,
              [withBaseName("menuItemSelected")]:
                !isDisabled && !hasSubMenu && isInteracted,
              ...interactionClasses,
              [withBaseName("menuItemWithScrollbar")]: hasScrollbar,
            },
            className,
          )}
          disabled={isDisabled}
          role="menuitem"
          onClick={handleOnClick}
          item={sourceItem}
          // TODO highlightProps - see original code?
          {...restProps}
        >
          {hasStartAdornment && (
            <div className={withBaseName("menuItemStartAdornmentContainer")}>
              {icon}
            </div>
          )}
          <div
            className={clsx(withBaseName("menuItemText"), {
              [withBaseName("menuItemDisabled")]: isDisabled,
            })}
            ref={menuTextRef}
          >
            {menuText}
          </div>
          {hasEndAdornment && (
            <div
              className={clsx(withBaseName("menuItemEndAdornmentContainer"), {
                [withBaseName("menuItemAdornmentHidden")]: !hasSubMenu,
              })}
            >
              <ExpandGroupIcon
                className={clsx(withBaseName("menuItemEndAdornment"), {
                  [withBaseName("menuItemDisabled")]: isDisabled,
                })}
              />
            </div>
          )}
          {/** biome-ignore lint/a11y/useAriaPropsForRole: Separator is not focusable, so it doesn't need aria-valuenow. */}
          {divider && <div role="separator" />}
        </ListItem>
      </Tooltip>
    );
  },
);
