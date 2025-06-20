import { Button, type ButtonProps, makePrefixer, useIcon } from "@salt-ds/core";
import { DEFAULT_ICON_SIZE, type IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AriaAttributes,
  type ComponentType,
  type ForwardedRef,
  forwardRef,
} from "react";
import { useFormFieldLegacyProps } from "../form-field-context-legacy";

import dropdownButtonCss from "./DropdownButton.css";

export interface DropdownButtonProps extends ButtonProps {
  /**
   * Replace the default Icon component
   */
  IconComponent?: ComponentType<any>;
  /**
   * Whether the dropdown button should hide role='option' via 'aria-hidden'
   */
  ariaHideOptionRole?: boolean;
  /**
   * If, `true`, the Dropdown button will occupy the full width of it's container
   */
  fullWidth?: boolean;
  /**
   * Sets the size of the down arrow icon. If this is not specified, a default size based on density is used.
   */
  iconSize?: IconProps["size"];
  /**
   * Is the dropdown list open
   */
  isOpen?: boolean;
  /**
   * Label for the dropdown button
   */
  label?: string;
  /**
   * Id for the label. This is needed for ARIA attributes.
   */
  labelId?: string;
  /**
   * When the dropdown is collapsed this value is set as aria-posinset on the span containing the selected value
   * **/
  posInSet?: number;
  /**
   * When the dropdown is collapsed this value is set as aria-setsize on the span containing the selected value
   * **/
  setSize?: number;
  /**
   *
   * **/
  labelAriaAttributes?: Pick<
    AriaAttributes,
    "aria-posinset" | "aria-setsize" | "aria-selected"
  >;
}

const withBaseName = makePrefixer("saltDropdownButton");

export const DropdownButton = forwardRef(function DropdownButton(
  {
    IconComponent,
    ariaHideOptionRole,
    className,
    disabled,
    iconSize = DEFAULT_ICON_SIZE,
    isOpen,
    label,
    labelId,
    fullWidth,
    posInSet,
    setSize,
    labelAriaAttributes,
    ...rest
  }: DropdownButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dropdown-button",
    css: dropdownButtonCss,
    window: targetWindow,
  });
  const { ExpandIcon } = useIcon();
  const Icon = IconComponent === undefined ? ExpandIcon : IconComponent;
  const { inFormField } = useFormFieldLegacyProps();
  // FIXME: use polymorphic button
  // We don't want the 'button' tag to be shown in the DOM to trigger some accessibility testing
  // tool's false alarm on role of 'listbox'
  return (
    <Button
      className={clsx(
        withBaseName(),
        {
          [withBaseName("fullwidth")]: fullWidth,
          [withBaseName("formField")]: inFormField,
        },
        className,
      )}
      data-testid="dropdown-button"
      disabled={disabled}
      variant="secondary"
      {...rest}
      ref={ref}
    >
      <div className={withBaseName("content")}>
        <span
          // 'hidden' so that screen reader won't be confused the additional 'option' which is just a label
          aria-hidden={ariaHideOptionRole ? "true" : undefined}
          {...labelAriaAttributes}
          className={withBaseName("buttonLabel")}
          id={labelId}
          // biome-ignore lint/a11y/useAriaPropsForRole: 'option' role here is to suppress accessibility testing tool warning about 'listbox' missing children role
          role="option"
        >
          {label}
        </span>
        <Icon
          className={withBaseName("icon")}
          size={iconSize}
          aria-label={null}
          aria-hidden="true"
        />
      </div>
    </Button>
  );
});
