import {
  Children,
  type ComponentType,
  cloneElement,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import type { GridColumnGroupModel } from "./Grid";
import type { GridColumnPin } from "./GridColumn";
import { useGridContext } from "./GridContext";

export interface ColumnGroupCellProps {
  group: GridColumnGroupModel;
}

export interface ColumnGroupCellValueProps {
  group: GridColumnGroupModel;
}

export interface ColumnGroupProps {
  children: ReactNode;
  name: string;
  id: string;
  pinned?: GridColumnPin;
  headerComponent?: ComponentType<ColumnGroupCellProps>;
  headerValueComponent?: ComponentType<ColumnGroupCellValueProps>;
}

export function ColumnGroup(props: ColumnGroupProps) {
  const pinned = props.pinned || null;
  const indexRef = useRef<number>();
  const grid = useGridContext();
  useEffect(() => {
    indexRef.current = grid.getChildIndex(props.id);
    grid.onColumnGroupAdded(props);
    return () => {
      grid.onColumnGroupRemoved(indexRef.current!, props);
    };
  });
  const childrenWithPinnedOverridden = Children.map(props.children, (child) => {
    if (isValidElement<ColumnGroupProps>(child)) {
      return cloneElement(child, { pinned });
    }
    return child;
  });
  return <>{childrenWithPinnedOverridden}</>;
}
