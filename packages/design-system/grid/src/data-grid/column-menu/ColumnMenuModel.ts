import { TextColumnFilterModel } from "./TextColumnFilterModel";
import { ColumnSettingsModel } from "./ColumnSettingsModel";

export class ColumnMenuModel {
  public readonly filter: TextColumnFilterModel;
  public readonly settings: ColumnSettingsModel;

  constructor() {
    this.filter = new TextColumnFilterModel();
    this.settings = new ColumnSettingsModel();
  }
}
