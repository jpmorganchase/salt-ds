import { BehaviorSubject } from "rxjs";
import { Column } from "../Column";
import { sumWidths } from "../sumWidths";

export function createHeaderVisibleColumnWidth(
  headerVisibleColumns$: BehaviorSubject<Column[]>
) {
  const headerVisibleColumnWidth$ = new BehaviorSubject<number>(0);
  sumWidths(headerVisibleColumns$).subscribe(headerVisibleColumnWidth$);
  return headerVisibleColumnWidth$;
}
