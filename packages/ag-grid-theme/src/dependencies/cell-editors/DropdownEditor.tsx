import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  type SyntheticEvent,
  type KeyboardEvent,
} from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { Dropdown, type DropdownProps, Option } from "@salt-ds/core";

export type GridCellValue = string | boolean | number;

export interface DropdownEditorParams extends ICellEditorParams {
  source?: Array<GridCellValue>;
  dropdownProps?: Partial<DropdownProps<string>>;
}

export const DropdownEditor = forwardRef((props: DropdownEditorParams, ref) => {
  const { value: initialValue, source = [], dropdownProps } = props;
  const [value, setValue] = useState(initialValue);

  const button = React.useRef<HTMLButtonElement>(null);

  const onSelect = useCallback(
    (_event: SyntheticEvent, selectedValue: Array<GridCellValue>) => {
      setValue(selectedValue[0]);

      // hack to make selection actually record the edit.
      // timeout is necessary because otherwise the grid stops editing
      // before the useImperativeHandle getValue returns the new value state
      setTimeout(() => {
        props.api!.stopEditing();
      }, 100);
    },
    [props.api],
  );

  const onEscapeKeyPressed = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.api!.stopEditing();
      }
    },
    [props.api],
  );

  useEffect(() => {
    button.current!.focus();
  }, []);

  useImperativeHandle(ref, () => ({ getValue: (): typeof value => value }));

  console.log("--- DropdownEditor", { value });

  return (
    <Dropdown
      onSelectionChange={onSelect}
      defaultOpen={props.cellStartedEdit}
      selected={[value || ""]}
      ref={button}
      onKeyDown={onEscapeKeyPressed}
      {...dropdownProps}
    >
      <div
        ref={(elem): void => {
          if (!elem) return;
          // current element -> list container -> list box that matters
          (
            (elem.parentElement as HTMLElement).parentElement as HTMLElement
          ).className += " ag-custom-component-popup";
        }}
      >
        {source.map((item) => (
          <Option value={item} key={String(item)} />
        ))}
      </div>
    </Dropdown>
  );
});
