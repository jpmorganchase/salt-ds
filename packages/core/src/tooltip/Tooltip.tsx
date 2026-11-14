import { useClassNameInjection } from "@salt-ds/styles";
import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
  useState,
} from "react";
import {
  type FormFieldValidationStatus,
  useFormFieldProps,
} from "../form-field-context";
import type { ValidationStatus } from "../status-indicator";
import {
  getRefFromChildren,
  makePrefixer,
  mergeProps,
  type UseFloatingUIProps,
  useFloatingComponent,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "../utils";
import { TooltipBase } from "./TooltipBase";
import { type UseTooltipProps, useTooltip } from "./useTooltip";

const withBaseName = makePrefixer("saltTooltip");

function useOwnedHelperTextId(
  helperTextId: string | undefined,
  open: boolean,
  referenceElement: Element | null,
  floatingElement: HTMLElement | null,
) {
  const [ownedHelperTextId, setOwnedHelperTextId] = useState<string>();

  useIsomorphicLayoutEffect(() => {
    if (!open || !helperTextId || !referenceElement || !floatingElement) {
      setOwnedHelperTextId(undefined);
      return;
    }

    // ID references resolve in the trigger's document or shadow root. A real
    // FormFieldHelperText or another tooltip can own the same helper ID.
    const root = referenceElement.getRootNode() as Document | ShadowRoot;
    if (typeof root.getElementById !== "function") {
      setOwnedHelperTextId(undefined);
      return;
    }
    const updateHelperTextId = () => {
      const helper = root.getElementById(helperTextId);
      const content = floatingElement.querySelector(
        `.${withBaseName("content")}`,
      );
      setOwnedHelperTextId(
        helper && helper === content ? helperTextId : undefined,
      );
    };
    updateHelperTextId();

    const mutationObserverCtor = (
      referenceElement.ownerDocument.defaultView as
        | (Window & { MutationObserver?: typeof MutationObserver })
        | null
    )?.MutationObserver;
    const observer = mutationObserverCtor
      ? new mutationObserverCtor(updateHelperTextId)
      : undefined;
    // An open tooltip may remain mounted while a sibling helper or another
    // tooltip is added, removed or given a different ID.
    observer?.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id"],
    });
    return () => observer?.disconnect();
  }, [helperTextId, open, referenceElement, floatingElement]);

  return open && ownedHelperTextId === helperTextId
    ? ownedHelperTextId
    : undefined;
}

export interface TooltipProps
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The children will be the Tooltip's trigger.
   */
  children: ReactNode;
  /**
   * Whether to hide the Tooltip arrow. Defaults to `false`.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide the status icon within the Tooltip. Defaults to `false`.
   * If no status is provided, icon will also be hidden.
   */
  hideIcon?: boolean;
  /**
   * Content displayed inside the Tooltip. Can be a string or a React component.
   */
  content: ReactNode;
  /**
   * Optional string to determine the status of the Tooltip.
   */
  status?: FormFieldValidationStatus | ValidationStatus;
  /**
   * Delay in milliseconds before the Tooltip is shown.
   */
  enterDelay?: number;
  /**
   * Delay in milliseconds before the Tooltip is hidden. Defaults to 300ms.
   */
  leaveDelay?: number;
  /**
   * Option to not display the Tooltip. Can be used in conditional situations like text truncation. Defaults to 0.
   */
  disabled?: boolean;
  /**
   * Option to remove the hover listener.
   */
  disableHoverListener?: boolean;
  /**
   * Option to remove the focus listener.
   */
  disableFocusListener?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { className, props: finalProps } = useClassNameInjection(
      "saltTooltip",
      props,
    );

    const {
      children,
      disabled: disabledProp = false,
      hideArrow = false,
      hideIcon = false,
      open: openProp,
      content,
      status: statusProp,
      placement = "right",
      enterDelay = 300,
      leaveDelay = 0,
      ...rest
    } = finalProps;

    const {
      a11yProps: { "aria-describedby": formFieldDescribedBy } = {},
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const disabled = disabledProp || formFieldDisabled;
    const status = statusProp ?? (formFieldValidationStatus || undefined);
    const { Component: FloatingComponent } = useFloatingComponent();

    const hookProps: UseTooltipProps = {
      open: openProp,
      disabled,
      placement,
      enterDelay,
      leaveDelay,
      ...rest,
    };

    const {
      arrowProps,
      open,
      floating,
      reference,
      getTriggerProps,
      getTooltipProps,
      getTooltipPosition,
    } = useTooltip(hookProps);

    const triggerRef = useForkRef(getRefFromChildren(children), reference);

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);
    const hasContent = content != null && content !== "";
    const isOpen = open && !disabled && hasContent;
    const ownedHelperTextId = useOwnedHelperTextId(
      formFieldDescribedBy,
      isOpen,
      arrowProps.context.elements.domReference,
      arrowProps.context.elements.floating,
    );
    const triggerProps = getTriggerProps();
    // Reuse the FormField reference only when it resolves to this tooltip's
    // helper span; otherwise preserve the tooltip's own generated reference.
    if (ownedHelperTextId && triggerProps["aria-describedby"]) {
      triggerProps["aria-describedby"] = ownedHelperTextId;
    }

    return (
      <>
        {isValidElement<{ ref?: Ref<unknown> }>(children) &&
          cloneElement(children, {
            ...mergeProps(triggerProps, children.props),
            ref: triggerRef,
          })}

        <FloatingComponent
          className={clsx(
            withBaseName(),
            { [withBaseName(status ?? "")]: status },
            className,
          )}
          open={isOpen}
          {...getTooltipProps()}
          ref={floatingRef}
          {...getTooltipPosition()}
        >
          <TooltipBase
            hideIcon={hideIcon}
            status={status}
            content={content}
            hideArrow={hideArrow}
            arrowProps={arrowProps}
          />
        </FloatingComponent>
      </>
    );
  },
);
