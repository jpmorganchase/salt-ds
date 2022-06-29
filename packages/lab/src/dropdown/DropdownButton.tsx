import {
  Button,
  ButtonProps,
  makePrefixer,
  useFormFieldProps,
} from "@jpmorganchase/uitk-core";
import { ChevronDownIcon, IconProps } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import { AriaAttributes, ComponentType, ForwardedRef, forwardRef } from "react";

import "./DropdownButton.css";

export interface DropdownButtonProps extends ButtonProps<"div"> {
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

const withBaseName = makePrefixer("uitkDropdownButton");

export const DropdownButton = forwardRef(function DropdownButton(
  {
    IconComponent = ChevronDownIcon,
    ariaHideOptionRole,
    className,
    disabled,
    iconSize = "small",
    isOpen,
    label,
    labelId,
    fullWidth,
    posInSet,
    setSize,
    labelAriaAttributes,
    ...rest
  }: DropdownButtonProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { inFormField } = useFormFieldProps();

  return (
    <Button
      className={classnames(
        withBaseName(),
        {
          [withBaseName("fullwidth")]: fullWidth,
          [withBaseName("formField")]: inFormField,
        },
        className
      )}
      // We don't want the 'button' tag to be shown in the DOM to trigger some accessibility testing
      // tool's false alarm on role of 'listbox'
      elementType="div"
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
          // 'option' role here is to suppress accessibility testing tool warning about 'listbox' missing children role.
          role="option"
          data-testid="dropdown-button-label"
        >
          {label}
        </span>
        <IconComponent
          className={withBaseName("icon")}
          size={iconSize}
          aria-label={null}
          aria-hidden="true"
        />
      </div>
    </Button>
  );
});
