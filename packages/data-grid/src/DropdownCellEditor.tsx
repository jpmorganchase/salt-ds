import { makePrefixer } from "@salt-ds/core";
import {
  Dropdown,
  type SelectHandler,
  type SelectionChangeHandler,
} from "@salt-ds/lab";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useEffect, useRef } from "react";

import { CellFrame } from "./CellFrame";
import { CornerTag } from "./CornerTag";
import dropdownCellEditorCss from "./DropdownCellEditor.css";
import { useEditorContext } from "./EditorContext";
import type { GridColumnModel, GridRowModel } from "./Grid";

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

  const onSelect: SelectHandler = (event, item) => {
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
    <CellFrame separator={column?.separator} className={withBaseName()}>
      <div className={withBaseName("dropdownContainer")}>
        {options && options.length > 0 ? (
          <Dropdown
            isOpen={true}
            source={options}
            defaultSelected={value}
            onSelectionChange={onSelectionChange}
            onSelect={onSelect}
            triggerComponent={triggerComponent}
            width={column!.info.width! - 5}
          />
        ) : (
          triggerComponent
        )}
      </div>
      <CornerTag />
    </CellFrame>
  );
}
