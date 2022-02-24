import classnames from "classnames";
import { ForwardedRef, forwardRef, ReactElement } from "react";
import { makePrefixer } from "@brandname/core";
import { ChevronDownIcon } from "@brandname/icons";
import { ListBase, ListStateContext } from "../list";
import { Popper } from "../popper";
import { useForkRef } from "../utils";
import { DropdownProps } from "./Dropdown";
import { DropdownButton } from "./DropdownButton";
import { useDropdown } from "./useDropdown";

import "./Dropdown.css";

export type MultiSelectDropdownProps<Item = string> = DropdownProps<
  Item,
  "multiple"
>;

const withBaseName = makePrefixer("uitkDropdown");

/**
 * Renders a multi-select dropdown with selectable items
 */
export const MultiSelectDropdown = forwardRef(function MultiSelectDropdown<
  Item
>(
  {
    IconComponent = ChevronDownIcon,
    className,
    children,
    PopperProps,
    width = "180px",
    ...restProps
  }: MultiSelectDropdownProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { rootProps, buttonProps, listContext, listProps } = useDropdown<
    Item,
    "multiple"
  >({ IconComponent, width, ...restProps }, true);

  const {
    disabled,
    fullWidth,
    isOpen,
    ref: rootRef,
    ...restRootProps
  } = rootProps;

  return (
    <div
      className={classnames(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("fullwidth")]: fullWidth,
        },
        className
      )}
      ref={useForkRef(rootRef, ref)}
      {...restRootProps}
    >
      {children ? (
        children({
          DropdownButtonProps: buttonProps,
          isOpen,
          itemToString: listProps.itemToString,
          selectedItem: listContext.state.selectedItem,
        })
      ) : (
        <DropdownButton {...buttonProps} />
      )}
      {rootRef.current && (
        <Popper
          anchorEl={rootRef.current}
          className={withBaseName("popper")}
          open={isOpen}
          placement="bottom-start"
          // We don't want the default role of 'tooltip'
          role={undefined}
          {...PopperProps}
        >
          <ListStateContext.Provider value={listContext}>
            <ListBase data-testid="dropdown-list" {...listProps} />
          </ListStateContext.Provider>
        </Popper>
      )}
    </div>
  );
}) as <Item = string>(
  props: DropdownProps<Item, "multiple"> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<DropdownProps<Item, "multiple">>;
