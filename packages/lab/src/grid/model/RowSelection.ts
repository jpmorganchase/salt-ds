import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Subject,
} from "rxjs";
import { useObservable } from "./useObservable";
import { RowKeyGetter } from "../Grid";
import { RowSelectionMode } from "./GridModel";

export interface SelectAllEvent {
  isAllSelected: boolean;
}

export interface SelectRowsEvent {
  rowKeys: string[];
  clearPreviouslySelected?: boolean;
  isSelected?: boolean;
}

export interface ToggleRowSelectionEvent {
  rowKey: string;
}

export interface IRowSelection<T> {
  readonly selectAll: (isAllSelected: boolean) => void;
  readonly toggleRow: (rowKey: string) => void;
  readonly selectRows: (event: SelectRowsEvent) => void;
  readonly useIsAllSelected: () => boolean;
}

export class RowSelection<T> implements IRowSelection<T> {
  public readonly selectedKeys$ = new BehaviorSubject<Set<string>>(new Set());
  public readonly selectAllEvents$ = new Subject<SelectAllEvent>();
  private readonly rowSelectionMode$: BehaviorSubject<RowSelectionMode>;

  public selectAll(isAllSelected: boolean) {
    this.selectAllEvents$.next({ isAllSelected });
  }

  public readonly toggleRowEvents$ = new Subject<ToggleRowSelectionEvent>();
  public toggleRow(rowKey: string) {
    this.toggleRowEvents$.next({ rowKey });
  }

  public readonly selectRowsEvents$ = new Subject<SelectRowsEvent>();
  public selectRows(event: SelectRowsEvent) {
    this.selectRowsEvents$.next(event);
  }

  public readonly isAllSelected$ = new BehaviorSubject<boolean>(false);
  public useIsAllSelected() {
    return useObservable(this.isAllSelected$);
  }

  public constructor(
    data$: BehaviorSubject<T[]>,
    getRowKey: RowKeyGetter<T>,
    rowSelectionMode$: BehaviorSubject<RowSelectionMode>
  ) {
    this.rowSelectionMode$ = rowSelectionMode$;

    data$.subscribe((data) => {
      const allKeys = new Set(data.map(getRowKey));
      const newKeys = new Set<string>();
      for (let k of this.selectedKeys$.getValue()) {
        if (allKeys.has(k)) {
          newKeys.add(k);
        }
      }
      this.selectedKeys$.next(newKeys);
    });

    combineLatest([this.selectedKeys$, data$])
      .pipe(
        map(([selectedKeys, data]) => {
          return data.length === selectedKeys.size;
        }),
        distinctUntilChanged()
      )
      .subscribe(this.isAllSelected$);

    this.selectAllEvents$.subscribe((event) => {
      const newKeys = event.isAllSelected
        ? new Set(data$.getValue().map(getRowKey))
        : new Set<string>();
      this.selectedKeys$.next(newKeys);
    });

    this.toggleRowEvents$.subscribe((event) => {
      const rowSelectionMode = this.rowSelectionMode$.getValue();
      if (rowSelectionMode === "single") {
        this.selectedKeys$.next(new Set(event.rowKey));
      } else {
        const newKeys = new Set(this.selectedKeys$.getValue());
        if (newKeys.has(event.rowKey)) {
          newKeys.delete(event.rowKey);
        } else {
          newKeys.add(event.rowKey);
        }
        this.selectedKeys$.next(newKeys);
      }
    });

    this.selectRowsEvents$.subscribe((event) => {
      const rowSelectionMode = this.rowSelectionMode$.getValue();
      if (rowSelectionMode === "single") {
        const newKeys = new Set<string>();
        newKeys.add(event.rowKeys[0]);
        this.selectedKeys$.next(newKeys);
      } else {
        const newKeys = event.clearPreviouslySelected
          ? new Set<string>()
          : new Set(this.selectedKeys$.getValue());
        if (event.isSelected) {
          for (let k of event.rowKeys) {
            newKeys.add(k);
          }
        } else {
          for (let k of event.rowKeys) {
            newKeys.delete(k);
          }
        }
        this.selectedKeys$.next(newKeys);
      }
    });
  }
}
