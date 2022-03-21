import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  sampleTime,
  Subject,
  switchMap,
} from "rxjs";
import { ColumnDragAndDropEvent } from "./ColumnDrag";
import { Column } from "./Column";
import { ColumnDropTarget } from "./ColumnDropTarget";
import { ColumnMoveEvent, ColumnsAndGroups } from "./GridModel";
import { useObservable } from "./useObservable";

export type ColumnDragAndDropState = "idle" | "dragging" | "dropping";

function columnsToStream(columns: Column[]) {
  return columns.map((c) => c.width$.pipe(map((width) => ({ ...c, width }))));
}

// Find all drop targets, basically all visible edges of all columns
function calcTargets(
  columnsAndGroups$: BehaviorSubject<ColumnsAndGroups>,
  scrollLeft$: BehaviorSubject<number>,
  clientMiddleWidth$: BehaviorSubject<number>
): Observable<ColumnDropTarget[]> {
  return combineLatest([
    columnsAndGroups$,
    scrollLeft$,
    clientMiddleWidth$,
  ]).pipe(
    map(
      ([
        { leftColumns, middleColumns, rightColumns },
        scrollLeft,
        clientMiddleWidth,
      ]) => {
        const targets: ColumnDropTarget[] = [];
        let x = 0;
        leftColumns.forEach((c, i) => {
          targets.push({ x, columnIndex: c.index });
          x += c.width$.getValue();
        });
        let w = scrollLeft;
        let i = 0;
        while (w > 0 && i < middleColumns.length) {
          w -= middleColumns[i].width$.getValue();
          i++;
        }
        x -= w;
        w += clientMiddleWidth;
        while (w > 0 && i < middleColumns.length) {
          const c = middleColumns[i];
          targets.push({ x, columnIndex: c.index });
          x += c.width$.getValue();
          w -= c.width$.getValue();
          i++;
        }
        x += w;
        rightColumns.forEach((c, i) => {
          targets.push({ x, columnIndex: c.index });
          x += c.width$.getValue();
        });
        if (rightColumns.length > 0) {
          targets.push({
            x,
            columnIndex: rightColumns[rightColumns.length - 1].index + 1,
          });
        }
        return targets;
      }
    )
  );
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface IColumnDragAndDrop<T> {
  readonly useMovingColumn: () => Column<T> | undefined;
  readonly usePosition: () => MousePosition;
  readonly useCurrentTarget: () => ColumnDropTarget | undefined;
  readonly start: (columnIndex: number, x: number, y: number) => void;
  readonly move: (x: number, y: number) => void;
  readonly drop: () => void;
}

export class ColumnDragAndDrop<T> implements IColumnDragAndDrop<T> {
  public useMovingColumn() {
    return useObservable(this.movingColumn$);
  }

  public usePosition() {
    return useObservable(this.position$);
  }

  public useCurrentTarget() {
    return useObservable(this.currentTarget$);
  }

  public start(columnIndex: number, x: number, y: number) {
    this.events$.next({ action: "start", columnIndex, x, y });
  }

  public move(x: number, y: number) {
    this.events$.next({ action: "move", x, y });
  }

  public drop() {
    this.events$.next({ action: "drop" });
  }

  private readonly columnIndex$ = new BehaviorSubject<number>(0);
  private readonly movingColumn$ = new BehaviorSubject<Column<T> | undefined>(
    undefined
  );
  private readonly position$ = new BehaviorSubject<MousePosition>({
    x: 0,
    y: 0,
  });
  private readonly targets$ = new BehaviorSubject<
    ColumnDropTarget[] | undefined
  >(undefined);
  private readonly targetIndex$ = new BehaviorSubject<number>(0);
  private readonly currentTarget$ = new BehaviorSubject<
    ColumnDropTarget | undefined
  >(undefined);
  private readonly events$ = new Subject<ColumnDragAndDropEvent>();
  private readonly state$ = new BehaviorSubject<ColumnDragAndDropState>("idle");

  constructor(
    columnsAndGroups$: BehaviorSubject<ColumnsAndGroups>,
    scrollLeft$: BehaviorSubject<number>,
    clientMiddleWidth$: BehaviorSubject<number>,
    columnMove$: Subject<ColumnMoveEvent>
  ) {
    // Keep updating the targets list when the user is dragging a column (state
    // is not idle)
    this.state$
      .pipe(
        map((state) => {
          if (state === "idle") {
            return of(undefined);
          }
          return calcTargets(
            columnsAndGroups$,
            scrollLeft$,
            clientMiddleWidth$
          );
        }),
        switchMap((x) => x)
      )
      .subscribe(this.targets$);

    // Moving column
    // undefined when nothing is moving
    this.state$
      .pipe(
        map((state) => {
          if (state === "idle") {
            return of(undefined);
          }
          return combineLatest([this.columnIndex$, columnsAndGroups$]).pipe(
            map(
              ([columnIndex, { leftColumns, middleColumns, rightColumns }]) => {
                return [...leftColumns, ...middleColumns, ...rightColumns].find(
                  (c) => c.index === columnIndex
                );
              }
            )
          );
        }),
        switchMap((x) => x),
        distinctUntilChanged()
        // tap((c) => console.log(`movingColumn$: ${c ? c.key : c}`))
      )
      .subscribe(this.movingColumn$);

    // Calculating current target based on mouse position
    combineLatest([this.position$, this.targets$])
      .pipe(
        sampleTime(50),
        map(([{ x }, targets]) => {
          if (targets == null) {
            return 0;
          }
          return getNearestTargetIndex(targets, x);
        }),
        distinctUntilChanged()
        // tap((index) => console.log(`targetIndex$: ${index}`))
      )
      .subscribe(this.targetIndex$);

    // Sending columnMove event when column has been dropped
    this.state$.pipe(filter((s) => s === "dropping")).subscribe(() => {
      const columnIndex = this.columnIndex$.getValue();
      const currentTarget = this.currentTarget$.getValue();
      if (currentTarget) {
        columnMove$.next({
          columnIndex,
          newIndex: currentTarget.columnIndex,
        });
      }
      this.state$.next("idle");
    });

    // Current target
    combineLatest([this.targets$, this.targetIndex$])
      .pipe(
        map(([targets, targetIndex]) => {
          if (!targets || targetIndex < 0 || targetIndex >= targets.length) {
            return undefined;
          }
          return targets[targetIndex];
        }),
        distinctUntilChanged()
        // tap((t) => console.log(`currentTarget$: ${JSON.stringify(t)}`))
      )
      .subscribe(this.currentTarget$);

    this.events$.subscribe((event) => {
      switch (event.action) {
        case "start":
          this.state$.next("dragging");
          this.position$.next({ x: event.x, y: event.y });
          this.columnIndex$.next(event.columnIndex);
          break;
        case "move":
          this.position$.next({ x: event.x, y: event.y });
          break;
        case "drop":
          this.state$.next("dropping");
          break;
      }
    });
  }
}

function getNearestTargetIndex(targets: ColumnDropTarget[], x: number) {
  let i = 0;
  while (i < targets.length && targets[i].x < x) {
    i++;
  }
  if (i === 0) {
    return 0;
  }
  if (i >= targets.length) {
    return targets.length - 1;
  }
  return targets[i].x - x < x - targets[i - 1].x ? i : i - 1;
}
