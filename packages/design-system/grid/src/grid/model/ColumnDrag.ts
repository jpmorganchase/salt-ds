export interface ColumnDragStartEvent {
  action: "start";
  columnIndex: number;
  x: number;
  y: number;
}

export interface ColumnDragEvent {
  action: "move";
  x: number;
  y: number;
}

export interface ColumnDropEvent {
  action: "drop";
}

export type ColumnDragAndDropEvent =
  | ColumnDragStartEvent
  | ColumnDragEvent
  | ColumnDropEvent;
