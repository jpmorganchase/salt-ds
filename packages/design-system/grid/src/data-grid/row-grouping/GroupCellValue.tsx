import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GroupRowNode, isGroupNode } from "../DataGridModel";
import "./GroupCellValue.css";
import { useDataGridNextContext } from "../DataGridContext";
import { ChevronDownIcon, ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import { TreeLines } from "./TreeLines";
import { CSSProperties, useCallback, useMemo } from "react";
import { DataGridCellValueProps } from "../column-types";

const withBaseName = makePrefixer("uitkDataGridGroupCellValue");

export const GroupCellValue = function GroupCellValue<TRowData, TColumnData>(
  props: DataGridCellValueProps<TRowData, TColumnData>
) {
  const { rowNode } = props;
  const model = useDataGridNextContext();
  const showTreeLines = model.dataGridModel.useShowTreeLines();
  const name = rowNode.name;
  const level = rowNode.level;
  const rowGrouping = model.dataGridModel.useRowGrouping();

  const hasComponent =
    rowGrouping != undefined &&
    rowGrouping.groupLevels != undefined &&
    rowGrouping.groupLevels.length > level;

  const ValueComponent = hasComponent
    ? rowGrouping.groupLevels[level].groupCellComponent
    : undefined;

  const style: CSSProperties = useMemo(() => {
    if (showTreeLines) {
      return {};
    }
    return {
      marginLeft: `${level * 16}px`,
    };
  }, [level, showTreeLines]);

  const isGroup = isGroupNode(rowNode);

  const onClick = useCallback(() => {
    if (isGroup) {
      model.dataGridModel.expandCollapseNode({
        rowNode,
        expand: !rowNode.isExpanded$.getValue(),
      });
    }
  }, [isGroup]);

  const isExpanded = isGroup && rowNode.useIsExpanded();

  const renderValue = () => {
    if (ValueComponent) {
      return <ValueComponent rowNode={rowNode as GroupRowNode} />;
    }
    return (
      <div className={isGroup ? "" : withBaseName("leafName")}>{name}</div>
    );
  };

  return (
    <div className={withBaseName()} style={style} onClick={onClick}>
      {showTreeLines ? <TreeLines lines={rowNode.treeLines} /> : null}
      {isGroup ? (
        <div className={withBaseName("icon")}>
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
      ) : null}
      {renderValue()}
    </div>
  );
};
