import { DataSetRow, TreeField } from "../../model";
import { CellValueProps } from "../../../grid";
import { CSSProperties } from "react";
import { useDataGridContext } from "../../DataGridContext";
import { makePrefixer } from "@brandname/core";
import { ChevronDownIcon, ChevronRightIcon } from "@brandname/icons";

const withBaseName = makePrefixer("uitkDataGrid");

export const TreeCellValue = function TreeCellValue<T>(
  props: CellValueProps<DataSetRow<T>, TreeField>
) {
  const field = props.value;
  const text = field.useText();
  const level = field.useLevel();
  const isExpanded = field.useIsExpanded();
  const isExpandable = field.useIsExpandable();
  const { dataSet } = useDataGridContext();

  const style: CSSProperties = {
    paddingLeft: level * 16,
  };

  const onClick = () => {
    dataSet.expandRow({ isExpanded: !isExpanded, rowKey: props.row.key });
  };

  const renderIcon = () => {
    return isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />;
  };

  return (
    <span
      className={withBaseName("treeCellValue")}
      onClick={onClick}
      style={style}
    >
      {isExpandable ? renderIcon() : null}
      <span className={withBaseName("treeCellText")}>{text}</span>
    </span>
  );
};
