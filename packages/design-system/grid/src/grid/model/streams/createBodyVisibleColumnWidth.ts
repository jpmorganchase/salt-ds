import { BehaviorSubject } from "rxjs";
import { Column } from "../Column";
import { sumWidths } from "../sumWidths";

export function createBodyVisibleColumnWidth(
  bodyVisibleColumns$: BehaviorSubject<Column[]>
) {
  const bodyVisibleColumnWidth$ = new BehaviorSubject<number>(0);
  sumWidths(bodyVisibleColumns$).subscribe(bodyVisibleColumnWidth$);
  return bodyVisibleColumnWidth$;
}
