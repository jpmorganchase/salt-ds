import {
  isDesktop,
  makePrefixer,
  Portal,
  useFloatingUI,
  useForkRef,
  useId,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { useEditorContext } from "./EditorContext";
import {
  Dropdown,
  DropdownButton,
  List,
  SelectionChangeHandler,
} from "@jpmorganchase/uitk-lab";
import { GridEditorProps } from "./GridColumn";
import "./DropdownCellEditor.css";
import {
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import { GridColumnModel, GridRowModel } from "./Grid";

const withBaseName = makePrefixer("uitkGridDropdownCellEditor");

export interface DropdownCellEditorProps<T> {
  options: string[];
  // Row and column are provided by the grid. See TableRow.tsx
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function DropdownCellEditor<T>(props: DropdownCellEditorProps<T>) {
  const { options, column, row } = props;
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const value = column!.info.props.getValue!(row!.data);

  const { endEditMode, cancelEditMode } = useEditorContext();

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
    <td className={withBaseName()}>
      <div className={withBaseName("dropdownContainer")}>
        <Dropdown
          ref={dropdownRef}
          isOpen={true}
          source={options}
          defaultSelected={value}
          onSelectionChange={onSelectionChange}
          triggerComponent={triggerComponent}
          width={column!.info.width! - 5}
        />
      </div>
    </td>
  );
}
