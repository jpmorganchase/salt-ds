import { FilterColumn, FilterModel } from "../filter";
import { SortModel } from "../sort";
import { RowGroupingModel } from "../row-grouping";

export class GridToolbarModel<T> {
  public readonly filter: FilterModel<T>;
  public readonly sort: SortModel<T>;
  public readonly rowGrouping: RowGroupingModel<T>;

  constructor(columns: FilterColumn<T>[]) {
    this.filter = new FilterModel<T>(columns);
    this.sort = new SortModel<T>(columns);
    this.rowGrouping = new RowGroupingModel<T>(columns);
  }
}
