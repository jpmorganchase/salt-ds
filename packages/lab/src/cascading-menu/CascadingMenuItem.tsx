import {
  makePrefixer,
  Tooltip,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import {
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ListItem, ListItemProps } from "../list";
import { MenuDescriptor } from "./CascadingMenuProps";

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

export const DefaultMenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function (props, ref) {
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
          [withBaseName(`menuItemKeyboardDisabled`)]:
            isDisabled && isInteracted,
        }
      : {
          [withBaseName(`menuItemHover`)]: !isDisabled && !blurSelected,
        };

    const icon = hasStartAdornment ? getIcon(sourceItem, isDisabled) : null;
    const tooltipTitle = sourceItem.tooltip || menuText;
    const { getTooltipProps, getTriggerProps } = useTooltip({
      disableFocusListener: true,
      disableHoverListener: true,
      enterDelay: tooltipEnterDelay,
      leaveDelay: tooltipLeaveDelay,
      placement: "top",
      disabled: !tooltipTitle || !hasTooltip || isChildMenuOpen,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<
      typeof ListItem
    >({
      "aria-expanded": isChildMenuOpen || undefined,
      className: classnames(
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
      ),
      disabled: isDisabled,
      role: "menuitem",
      onClick: handleOnClick,
      item: sourceItem,
      // TODO highlightProps - see original code?
      ...restProps,
    });

    const handleRef = useForkRef<HTMLDivElement>(triggerRef, ref);

    return (
      <>
        <Tooltip
          {...getTooltipProps({
            title: tooltipTitle,
          })}
        />
        <ListItem {...triggerProps} ref={handleRef}>
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
              className={classnames(
                withBaseName("menuItemEndAdornmentContainer"),
                {
                  [withBaseName("menuItemAdornmentHidden")]: !hasSubMenu,
                }
              )}
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
      </>
    );
  }
);
