import { useEffect, useRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { Dropdown, SelectionChangeHandler } from "@salt-ds/lab";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { useEditorContext } from "./EditorContext";
import { GridColumnModel, GridRowModel } from "./Grid";
import { CornerTag } from "./CornerTag";
import { Cell } from "./internal";

import dropdownCellEditorCss from "./DropdownCellEditor.css";

const withBaseName = makePrefixer("saltGridDropdownCellEditor");

export interface DropdownCellEditorProps<T> {
  options: ReadonlyArray<string>;
  // Row and column are provided by the grid. See TableRow.tsx
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function DropdownCellEditor<T>(props: DropdownCellEditorProps<T>) {
  const { options, column, row } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dropdown-cell-editor",
    css: dropdownCellEditorCss,
    window: targetWindow,
  });

  const triggerRef = useRef<HTMLDivElement>(null);

  const value = column!.info.props.getValue!(row!.data);

  const { endEditMode } = useEditorContext();

  const onSelectionChange: SelectionChangeHandler = (event, item) => {
    if (item) {
      endEditMode(item);
    }
  };

  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [triggerRef.current]);

  const triggerComponent = (
    <div
      tabIndex={0}
      ref={triggerRef}
      className={withBaseName("currentValue")}
      data-testid="grid-cell-editor-trigger"
    >
      {value}
    </div>
  );

  return (
    <Cell separator={column?.separator} className={withBaseName()}>
      <div className={withBaseName("dropdownContainer")}>
        <Dropdown
          isOpen={true}
          source={options}
          defaultSelected={value}
          onSelectionChange={onSelectionChange}
          triggerComponent={triggerComponent}
          width={column!.info.width! - 5}
        />
      </div>
      <CornerTag />
    </Cell>
  );
}
