import { useControlled } from "@salt-ds/core";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";

import { useFormFieldLegacyProps } from "../form-field-context-legacy";
import { type measurements, useResizeObserver, WidthOnly } from "../responsive";
import type { DropdownHookProps, DropdownHookResult } from "./dropdownTypes";
import { useClickAway } from "./useClickAway";

const NO_OBSERVER: string[] = [];

export const useDropdownBase = ({
  ariaLabelledBy: ariaLabelledByProp,
  defaultIsOpen,
  disabled,
  // TODO check how we're using fullWidth, do we need a separate value for the popup component
  fullWidth: fullWidthProp,
  id,
  isOpen: isOpenProp,
  onOpenChange,
  onKeyDown: onKeyDownProp,
  openOnFocus,
  popupWidth: popupWidthProp,
  rootRef,
  width,
}: DropdownHookProps): DropdownHookResult => {
  const justFocused = useRef<number | null>(null);
  const popperRef = useRef<HTMLElement | null>(null);
  const popperCallbackRef = useCallback((element: HTMLElement | null) => {
    popperRef.current = element;
  }, []);
  const [isOpen, setIsOpen] = useControlled({
    controlled: isOpenProp,
    default: Boolean(defaultIsOpen),
    name: "useDropdown",
    state: "isOpen",
  });

  const {
    inFormField,
    setFocused: setFormFieldFocused,
    a11yProps: { "aria-labelledby": ariaLabelledBy, ...restA11yProps } = {},
  } = useFormFieldLegacyProps();

  const [popup, setPopup] = useState<measurements>({
    width: popupWidthProp ?? width ?? 0,
  });

  const showDropdown = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const hideDropdown = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useClickAway({
    popperRef,
    rootRef,
    isOpen,
    onClose: hideDropdown,
  });

  const handleTriggerFocus = useCallback(() => {
    if (!disabled) {
      setFormFieldFocused?.(true);

      if (openOnFocus) {
        setIsOpen(true);
        onOpenChange?.(true);
        // Suppress response to click if click was the cause of focus
        justFocused.current = window.setTimeout(() => {
          justFocused.current = null;
        }, 1000);
      }
    }
  }, [disabled, onOpenChange, openOnFocus, setFormFieldFocused]);

  const handleTriggerBlur = useCallback(() => {
    setFormFieldFocused?.(false);
  }, [setFormFieldFocused]);

  const handleTriggerToggle = useCallback(
    (e: MouseEvent) => {
      // Do not trigger menu open for 'Enter' and 'SPACE' key as they're handled in `handleKeyDown`
      if (
        ["Enter", " "].indexOf(
          (e as unknown as KeyboardEvent<HTMLDivElement>).key,
        ) === -1
      ) {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        onOpenChange?.(newIsOpen);
      }
    },
    [isOpen, onOpenChange],
  );

  const handleKeydown = useCallback(
    (evt: KeyboardEvent<HTMLElement>) => {
      if ((evt.key === "Tab" || evt.key === "Escape") && isOpen) {
        // No preventDefault here, this behaviour does not need to be exclusive
        hideDropdown();
      } else if (
        (evt.key === "Enter" || evt.key === "ArrowDown" || evt.key === " ") &&
        !isOpen
      ) {
        evt.preventDefault();
        showDropdown();
      } else {
        onKeyDownProp?.(evt);
      }
    },
    [hideDropdown, isOpen, onKeyDownProp, showDropdown],
  );

  const fullWidth = fullWidthProp ?? inFormField;
  const measurements = fullWidth ? WidthOnly : NO_OBSERVER;
  useResizeObserver(rootRef, measurements, setPopup, fullWidth);

  const componentId = `${id}-dropdown`;

  const getAriaLabelledBy = (
    labelledBy: string | undefined,
    labelledByProp: string | undefined,
  ): string | undefined => {
    if (labelledBy === undefined && labelledByProp === undefined) {
      return undefined;
    }
    return [labelledBy, labelledByProp].filter((x) => !!x).join(" ");
  };

  // TODO do we use aria-popup - valid values are menu, dialog, grid, tree, listbox
  const triggerProps = {
    ...restA11yProps,
    "aria-expanded": isOpen,
    "aria-labelledby": getAriaLabelledBy(ariaLabelledBy, ariaLabelledByProp),
    "aria-owns": isOpen ? componentId : undefined,
    id: `${id}-control`,
    onClick: disabled || openOnFocus ? undefined : handleTriggerToggle,
    onFocus: handleTriggerFocus,
    onBlur: handleTriggerBlur,
    role: "listbox",
    onKeyDown: disabled ? undefined : handleKeydown,
    style: { width: fullWidth ? undefined : width },
  };

  const dropdownComponentProps = {
    "aria-labelledby": ariaLabelledBy,
    id: componentId,
    width: popup.width,
  };

  return {
    componentProps: dropdownComponentProps,
    popperRef: popperCallbackRef,
    isOpen,
    label: "Dropdown Button",
    triggerProps,
  };
};
