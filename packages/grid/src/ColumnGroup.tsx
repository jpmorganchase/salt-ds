import { useGridContext } from "./GridContext";
import {
  Children,
  cloneElement,
  ComponentType,
  isValidElement,
  ReactNode,
  useEffect,
} from "react";
import { GridColumnPin } from "./GridColumn";
import { GridColumnGroupModel } from "./Grid";

export interface ColumnGroupCellProps {
  group: GridColumnGroupModel;
}

export interface ColumnGroupProps {
  children: ReactNode;
  name: string;
  id: string;
  pinned?: GridColumnPin;
  headerComponent?: ComponentType<ColumnGroupCellProps>;
  headerValueComponent?: ComponentType<ColumnGroupCellProps>;
}

export function ColumnGroup(props: ColumnGroupProps) {
  const pinned = props.pinned || null;
  const table = useGridContext();
  useEffect(() => {
    table.onColumnGroupAdded(props);
    return () => {
      table.onColumnGroupRemoved(props);
    };
  });
  const childrenWithPinnedOverridden = Children.map(props.children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { pinned });
    }
    return child;
  });
  return <>{childrenWithPinnedOverridden}</>;
}
