import {
  Button,
  makePrefixer,
  useControlled,
  useIcon,
  useIdMemo as useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  cloneElement,
  type ForwardedRef,
  forwardRef,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useRef,
} from "react";

import {
  useCollectionItems,
  useKeyboardNavigationPanel,
} from "../../common-hooks";

import { DropdownBase, type DropdownBaseProps } from "../../dropdown";
import { ToolbarField, type ToolbarFieldProps } from "../toolbar-field";
import overflowPanelCss from "./OverflowPanel.css";
import { OverflowSeparator } from "./OverflowSeparator";

const withBaseName = makePrefixer("saltOverflowPanel");

export interface DropdownPanelProps extends DropdownBaseProps {
  /**
   * Trigger button icon
   */
  triggerButtonIcon?: JSX.Element;
  /**
   * Trigger button text
   */
  triggerButtonLabel?: string;
}

export const OverflowPanel = forwardRef(function DropdownPanel(
  {
    children,
    className,
    defaultIsOpen,
    isOpen: isOpenProp,
    onOpenChange,
    triggerButtonIcon,
    triggerButtonLabel,
    ...props
  }: DropdownPanelProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overflow-panel",
    css: overflowPanelCss,
    window: targetWindow,
  });
  const { OverflowIcon } = useIcon();
  const id = useId();
  const collectionHook = useCollectionItems<ReactElement>({
    id,
    children,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useControlled<boolean>({
    controlled: isOpenProp,
    default: defaultIsOpen || false,
    name: "DropdownPanel",
  });

  const { highlightedIndex: highlightedIdx, ...keyboardHook } =
    useKeyboardNavigationPanel({
      cycleFocus: true,
      defaultHighlightedIndex: 0,
      focusOnHighlight: true,
      indexPositions: collectionHook.data,
    });

  const focusTrigger = useCallback(() => {
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const setPanelRef = useCallback((el: HTMLElement | null) => el?.focus(), []);

  const handleItemClick = (evt: MouseEvent) => {
    // if (sourceItem.props["data-close-on-click"] !== false) closeMenu();
    setIsOpen(false);
    focusTrigger();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const getTriggerButtonIcon = () =>
    (triggerButtonIcon ?? triggerButtonLabel === undefined) ? (
      <OverflowIcon />
    ) : undefined;

  return (
    <DropdownBase
      {...props}
      className={clsx(withBaseName(), className)}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottom-end"
      ref={forwardedRef}
    >
      <Button variant="secondary" ref={triggerRef}>
        {getTriggerButtonIcon()}
        {triggerButtonLabel}
      </Button>
      <div
        className={withBaseName("content")}
        ref={setPanelRef}
        tabIndex={-1}
        {...keyboardHook.listProps}
      >
        {collectionHook.data.map((item) => {
          const { type } = item.value as ReactElement;
          if (type === OverflowSeparator) {
            return item.value;
          }
          const formFieldProps = {
            id: item.id,
            inOverflowPanel: true,
            key: item.id,
            onClick: handleItemClick,
          } as ToolbarFieldProps;

          if (type === ToolbarField) {
            return cloneElement(item.value as ReactElement, formFieldProps);
          }
          return (
            <ToolbarField {...formFieldProps} key={item.id}>
              {item.value}
            </ToolbarField>
          );
        })}
      </div>
    </DropdownBase>
  );
});
