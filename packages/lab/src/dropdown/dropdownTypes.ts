import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  RefObject,
} from "react";
import type { PortalProps } from "../portal";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export type DropdownPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"; // do any others make sense ?

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export interface DropdownBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect">,
    Pick<PortalProps, "disablePortal" | "container"> {
  defaultIsOpen?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  isOpen?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onOpenChange?: (isOpen: boolean) => void;
  openOnFocus?: boolean;
  placement?: DropdownPlacement;
  popupWidth?: number;
  triggerComponent?: ReactElement;
  width?: number | string;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export interface DropdownHookProps
  extends Pick<
    DropdownBaseProps,
    | "defaultIsOpen"
    | "disabled"
    | "fullWidth"
    | "isOpen"
    | "onOpenChange"
    | "onKeyDown"
    | "openOnFocus"
    | "popupWidth"
    | "width"
  > {
  ariaLabelledBy?: string;
  id: string;
  popupComponent: ReactElement;
  rootRef: RefObject<HTMLDivElement | null>;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export interface DropdownHookTriggerProps {
  "aria-expanded"?: boolean;
  "aria-labelledby"?: string;
  "aria-owns"?: string;
  id: string;
  onClick?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  role: string;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  style?: CSSProperties;
}

// We don't know what the popup component will be, but for those that
// support a width prop ...
interface ComponentProps extends HTMLAttributes<HTMLElement> {
  width?: number | string;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export interface DropdownHookResult {
  componentProps: ComponentProps;
  isOpen: boolean;
  label: string;
  popperRef: (node: HTMLElement | null) => void;
  triggerProps: DropdownHookTriggerProps;
}
