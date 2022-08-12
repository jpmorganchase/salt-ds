/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button, FormField, FormFieldProps } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import {
  cloneElement,
  FC,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  extractResponsiveProps,
  isResponsiveAttribute,
} from "../../responsive";
import { PanelItemRendererProps } from "./PanelItemRendererProps";

function useControlledTooltip(
  predicate: () => boolean,
  isNavigatingWithKeyboard: boolean,
  tooltipEnterDelay = 0,
  tooltipLeaveDelay = 0
) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipKeyboardTimer = useRef<number | undefined>(undefined);
  const tooltipMouseHoverTimer = useRef<number | undefined>(undefined);
  const tooltipMouseLeaveTimer = useRef<number | undefined>(undefined);
  const clearTimeouts = () => {
    clearTimeout(tooltipKeyboardTimer.current);
    clearTimeout(tooltipMouseHoverTimer.current);
    clearTimeout(tooltipMouseLeaveTimer.current);
  };
  useEffect(() => () => clearTimeouts(), []);

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

const renderToolbarField = (
  tool: ReactElement,
  toolbarItemProps: any,
  tooltrayFieldProps: Partial<FormFieldProps>
) => {
  const { children, ...fieldProps } = tool.props;
  const { fieldItemProps, ...itemProps } = toolbarItemProps;
  const [toolbarProps, props] = Object.keys(fieldProps).some(
    isResponsiveAttribute
  )
    ? extractResponsiveProps(tool.props)
    : [{}, tool.props];

  const visibleChild =
    children && children.length === 2 ? children[1] : children;

  const buttonProps = fieldItemProps;

  console.log({
    fieldProps,
    toolbarProps,
    tooltrayFieldProps,
    buttonProps,
    itemProps,
  });

  switch (tool.type) {
    case FormField:
      console.log(`DefaultPanelItemRenderer render a FormField`);
      return (
        <FormField
          {...fieldProps}
          {...toolbarProps}
          {...tooltrayFieldProps}
          fullWidth={false}
        >
          {cloneElement(visibleChild, {
            ...itemProps,
            ...buttonProps,
            ...visibleChild.props,
          })}
        </FormField>
      );
    default:
      console.log(`DefaultPanelItemRenderer render the default case`);
      const isButton = tool.type === Button;
      return (
        <FormField
          {...toolbarProps}
          {...tooltrayFieldProps}
          fullWidth={false}
          ActivationIndicatorComponent={() => null}
          className={isButton ? "uitkToolbarButton" : undefined}
        >
          {cloneElement(tool, { ...itemProps, ...buttonProps, ...props })}
        </FormField>
      );
  }
};

const OverflowPanelItem: FC<PanelItemRendererProps> = (props) => {
  const {
    sourceItem,
    onKeyDown,
    blurSelected,
    hasToolTip,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    isNavigatingWithKeyboard = false,
    closeMenu,
    isInteracted = false,
  } = props;

  const { disabled } = sourceItem.props;
  const { open, ...tooltipMouseListeners } = useControlledTooltip(
    () => isInteracted,
    isNavigatingWithKeyboard,
    tooltipEnterDelay,
    tooltipLeaveDelay
  );

  const handleOnClick = () => {
    if (sourceItem.props["data-close-on-click"] !== false) closeMenu();
  };

  const handleOnKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    onKeyDown && onKeyDown(evt, sourceItem.props["data-close-on-click"]);
  };

  const interactionClasses = isNavigatingWithKeyboard
    ? {
        "uitkOverflowPanel-menuItemKeyboardActive":
          !disabled && isInteracted && !blurSelected,
        "uitkOverflowPanel-menuItemKeyboardDisabled": disabled && isInteracted,
      }
    : {
        "uitkOverflowPanel-menuItemHover": !disabled && !blurSelected,
      };

  const toolbarButtonProps = {
    className: classnames({
      "uitkOverflowPanel-menuItemBlurSelected": blurSelected,
      "uitkOverflowPanel-menuItemSelected": !disabled && isInteracted,
      ...interactionClasses,
    }),
  };
  const fieldItemProps = {
    className: classnames("uitkOverflowPanel-fieldMenuItem"),
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const toolbarItemProps = {
    ...toolbarButtonProps,
    ...fieldItemProps,
  };
  const tooltrayFieldProps = {
    onClick: handleOnClick,
    onKeyDown: handleOnKeyDown,
  };

  // TODO - Add Tooltip
  // const { getTriggerProps, getTooltipProps } = useTooltip({
  //   disableFocusListener: true,
  //   disableHoverLIstener: true,
  //   enterDelay: tooltipEnterDelay,
  //   leaveDelay: tooltipLeaveDelay,
  //   open,
  //   placement: "top",
  //   disabled: !hasToolTip,
  // });

  return (
    <>{renderToolbarField(sourceItem, toolbarItemProps, tooltrayFieldProps)}</>
  );
};

export default OverflowPanelItem;
