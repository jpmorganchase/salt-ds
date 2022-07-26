import {
  FormField,
  FormFieldProps,
  useControlled,
  useIdMemo as useId,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, {
  forwardRef,
  ForwardedRef,
  useCallback,
  useRef,
  ReactElement,
} from "react";
import { Button, makePrefixer } from "@jpmorganchase/uitk-core";
import { OverflowMenuIcon } from "@jpmorganchase/uitk-icons";

import {
  useCollectionItems,
  useKeyboardNavigationPanel,
} from "../common-hooks";

import { DropdownBase, DropdownBaseProps } from "./DropdownBase";

import "./DropdownPanel.css";

const withBaseName = makePrefixer("uitkDropdownPanel");

const NullActivationIndicator = () => null;

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

export const DropdownPanel = forwardRef(function DropdownPanel(
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
  forwardedRef?: ForwardedRef<HTMLDivElement>
) {
  const id = useId();
  const collectionHook = useCollectionItems<ReactElement>({
    id,
    children,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useControlled<boolean>({
    controlled: isOpenProp,
    default: defaultIsOpen ?? false,
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

  const handleItemClick = () => {
    // if (sourceItem.props["data-close-on-click"] !== false) closeMenu();
    setIsOpen(false);
    focusTrigger();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const getTriggerButtonIcon = () =>
    triggerButtonIcon ?? triggerButtonLabel === undefined ? (
      <OverflowMenuIcon />
    ) : undefined;

  return (
    <DropdownBase
      {...props}
      className={cx(withBaseName(), className)}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottom-end"
      ref={forwardedRef}
      // onChange={handleChange}
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
          const formFieldProps = {
            ActivationIndicatorComponent: NullActivationIndicator,
            emphasis: "low",
            fullWidth: false,
            id: item.id,
            key: item.id,
            onClick: handleItemClick,
          } as FormFieldProps;
          switch ((item.value as ReactElement).type) {
            case FormField:
              return React.cloneElement(
                item.value as ReactElement,
                formFieldProps
              );
            default:
              return <FormField {...formFieldProps}>{item.value}</FormField>;
          }
        })}
      </div>
    </DropdownBase>
  );
});
