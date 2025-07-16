import { flip, limitShift, shift, size } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingUI,
  useForkRef,
  useIdMemo as useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { Children, cloneElement, forwardRef, useRef, useState } from "react";
import { Portal } from "../portal";
import { forwardCallbackProps } from "../utils";
import { isDesktop, useWindow as usePortalWindow } from "../window";
import dropdownCss from "./Dropdown.css";
import type { DropdownBaseProps } from "./dropdownTypes";
import { useDropdownBase } from "./useDropdownBase";
// Any component may be passed as our trigger or popup component.
// Define the common props that we will act on, if present,
// so we can type them.
export type MaybeChildProps = {
  className?: string;
  id?: string;
  role?: string;
  width: number | string;
};

const withBaseName = makePrefixer("saltDropdownBase");

export const DropdownBase = forwardRef<HTMLDivElement, DropdownBaseProps>(
  function Dropdown(
    {
      "aria-labelledby": ariaLabelledByProp,
      children,
      className: classNameProp,
      container,
      defaultIsOpen,
      disabled,
      disablePortal,
      fullWidth,
      id: idProp,
      isOpen: isOpenProp,
      onKeyDown,
      onOpenChange,
      openOnFocus,
      placement = "bottom-start",
      popupWidth,
      width,
      ...htmlAttributes
    },
    forwardedRef,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dropdown",
      css: dropdownCss,
      window: targetWindow,
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const className = clsx(withBaseName(), classNameProp, {
      [withBaseName("fullWidth")]: fullWidth,
      [withBaseName("disabled")]: disabled,
    });
    const [trigger, popupComponent] = Children.toArray(
      children,
    ) as JSX.Element[];
    const id = useId(idProp);
    const Window = usePortalWindow();

    const { componentProps, popperRef, isOpen, triggerProps } = useDropdownBase(
      {
        ariaLabelledBy: ariaLabelledByProp,
        defaultIsOpen,
        disabled,
        fullWidth,
        id,
        isOpen: isOpenProp,
        onOpenChange,
        onKeyDown,
        openOnFocus,
        popupComponent,
        popupWidth,
        rootRef,
        width,
      },
    );
    const [maxPopupHeight, setMaxPopupHeight] = useState<number | undefined>(
      undefined,
    );

    const middleware = isDesktop
      ? []
      : [
          flip({
            fallbackPlacements: ["bottom-start", "top-start"],
          }),
          shift({ limiter: limitShift() }),
          size({
            apply({ availableHeight }) {
              setMaxPopupHeight(availableHeight);
            },
          }),
        ];

    const { reference, floating, x, y, strategy } = useFloatingUI({
      placement,
      middleware,
    });

    const handlePopperListAdapterRef = useForkRef<HTMLDivElement>(
      reference,
      forwardedRef,
    );
    const handleRootRef = useForkRef(rootRef, handlePopperListAdapterRef);
    const handleFloatingRef = useForkRef<HTMLDivElement>(floating, popperRef);
    // TODO maybe we should pass style, with maxHeight, to the popupComponent

    const getTriggerComponent = () => {
      const {
        id: defaultId,
        role: defaultRole,
        ...restTriggerProps
      } = triggerProps;

      const {
        id = defaultId,
        role = defaultRole,
        ...ownProps
      } = trigger.props as MaybeChildProps;

      return cloneElement(
        trigger,
        forwardCallbackProps(ownProps, {
          ...restTriggerProps,
          id,
          role,
        }),
      );
    };

    const getPopupComponent = () => {
      const { id: defaultId, width, ...restComponentProps } = componentProps;
      const {
        className,
        id = defaultId,
        width: ownWidth,
        ...ownProps
      } = popupComponent.props as MaybeChildProps;
      return cloneElement(popupComponent, {
        ...ownProps,
        ...restComponentProps,
        className: clsx(className, withBaseName("popup-component")),
        id,
        width: ownWidth ?? width,
      });
    };

    return (
      <div
        {...htmlAttributes}
        className={className}
        data-testid="dropdown"
        id={idProp}
        ref={handleRootRef}
      >
        {getTriggerComponent()}
        {isOpen && (
          <Portal disablePortal={disablePortal} container={container}>
            <Window
              className={clsx(withBaseName("popup"), classNameProp)}
              id={`${id}-popup`}
              style={{
                top: y ?? 0,
                left: x ?? 0,
                position: strategy,
                maxHeight: maxPopupHeight,
              }}
              ref={handleFloatingRef}
            >
              {getPopupComponent()}
            </Window>
          </Portal>
        )}
      </div>
    );
  },
);
