import { BehaviorSubject } from "rxjs";
import { Column } from "../Column";
import { sumWidths } from "../sumWidths";

// Total width of the given columns
export function createColumnsWidth<T>(columns$: BehaviorSubject<Column<T>[]>) {
  const width$ = new BehaviorSubject<number>(0);
  sumWidths(columns$).subscribe(width$);
  return width$;
}
