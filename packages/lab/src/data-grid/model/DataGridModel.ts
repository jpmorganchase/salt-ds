import { DataSet, DataSetColumnDefinition, DataSetRow } from "../model";
import { createHandler, GridModel, KeyOfType } from "../../grid";
import { BehaviorSubject } from "rxjs";
import { createGridColumnDefinitions } from "./columnFactory";

export class DataGridModel<T = any> {
  public readonly gridModel: GridModel<DataSetRow<T>>;
  public readonly dataSet: DataSet<T>;
  private readonly data$ = new BehaviorSubject<T[]>([]);
  private readonly columnDefinitions$ = new BehaviorSubject<
    DataSetColumnDefinition<T>[]
  >([]);
  public setData = createHandler(this.data$);
  public setColumnDefinitions = createHandler(this.columnDefinitions$);

  constructor(
    getKey: (x: T) => string,
    childrenPropName: KeyOfType<T, T[] | undefined>
  ) {
    this.gridModel = new GridModel<DataSetRow<T>>((row) => row.key);
    this.dataSet = new DataSet<T>(getKey, childrenPropName);
    this.columnDefinitions$.subscribe((columnDefinitions) => {
      this.dataSet.setColumnDefinitions(columnDefinitions);
    });
    this.dataSet.columns$.subscribe((columns) => {
      this.gridModel.setColumnDefinitions(createGridColumnDefinitions(columns));
    });
    this.data$.subscribe((data) => this.dataSet.setData(data));
    this.dataSet.visibleRows$.subscribe((rows) => this.gridModel.setData(rows));
  }
}
