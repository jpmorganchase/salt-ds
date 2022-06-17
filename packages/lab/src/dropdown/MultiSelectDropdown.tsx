import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import {
  makePrefixer,
  Portal,
  useFloatingUI,
  useForkRef,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { ChevronDownIcon } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import { ForwardedRef, forwardRef, ReactElement, useState } from "react";
import { ListBase, ListStateContext } from "../list";
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
    container,
    disablePortal,
    width = "180px",
    ...restProps
  }: MultiSelectDropdownProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { rootProps, buttonProps, listContext, listProps } = useDropdown<
    Item,
    "multiple"
  >({ IconComponent, width, ...restProps }, true);
  const Window = useWindow();
  const [maxListHeight, setMaxListHeight] = useState<number | undefined>(
    undefined
  );
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware: [
      flip({
        fallbackPlacements: ["bottom-start", "top-start"],
      }),
      shift({ limiter: limitShift() }),
      size({
        apply({ availableHeight }) {
          setMaxListHeight(availableHeight);
        },
      }),
    ],
  });

  const {
    disabled,
    fullWidth,
    isOpen,
    ref: rootRef,
    ...restRootProps
  } = rootProps;

  const handleRootRef = useForkRef(rootRef, ref);
  const handleRef = useForkRef<HTMLDivElement>(reference, handleRootRef);

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
      ref={handleRef}
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
      {rootRef.current && isOpen && (
        <Portal disablePortal={disablePortal} container={container}>
          <Window
            className={withBaseName("popper")}
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
            ref={floating}
          >
            <ListStateContext.Provider value={listContext}>
              <ListBase
                data-testid="dropdown-list"
                maxHeight={maxListHeight}
                {...listProps}
              />
            </ListStateContext.Provider>
          </Window>
        </Portal>
      )}
    </div>
  );
}) as <Item = string>(
  props: DropdownProps<Item, "multiple"> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<DropdownProps<Item, "multiple">>;
