import {
  Button,
  makePrefixer,
  Portal,
  useFloatingUI,
  useId,
  useWindow,
} from "@jpmorganchase/uitk-core";
import {
  FilterIcon,
  SearchIcon,
  SwapIcon,
  TreeIcon,
} from "@jpmorganchase/uitk-icons";
import { Toolbar } from "@jpmorganchase/uitk-lab";
import "./GridToolbar.css";
import { useState } from "react";
import { GridToolbarModel } from "./GridToolbarModel";
import { Filter } from "../filter";
import { Sort } from "../sort";
import { RowGrouping } from "../row-grouping";

const withBaseName = makePrefixer("uitkDataGridToolbar");

export interface GridToolbarProps<T> {
  model: GridToolbarModel<T>;
}

type ToolbarState = "closed" | "filter" | "sort" | "rowGrouping";

export const GridToolbar = function GridToolbar<T>(props: GridToolbarProps<T>) {
  const { model } = props;
  const [toolbarState, setToolbarState] = useState<ToolbarState>("closed");

  const onFilterClick = () => {
    setToolbarState((s) => (s === "filter" ? "closed" : "filter"));
  };

  const onSortClick = () => {
    setToolbarState((s) => (s === "sort" ? "closed" : "sort"));
  };

  const onGroupingClick = () => {
    setToolbarState((s) => (s === "rowGrouping" ? "closed" : "rowGrouping"));
  };

  const id = useId();
  const Window = useWindow();
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-end",
    middleware: [],
  });

  return (
    <Toolbar className={withBaseName()} ref={reference}>
      <Button variant="secondary" onClick={onSortClick}>
        <SwapIcon className={withBaseName("sortIcon")} /> Sort
      </Button>
      <Button variant="secondary" onClick={onFilterClick}>
        <FilterIcon /> Filter
      </Button>
      <Button variant="secondary" onClick={onGroupingClick}>
        <TreeIcon /> Group
      </Button>
      <Button variant="secondary" disabled={true}>
        <SearchIcon /> Search
      </Button>
      {toolbarState !== "closed" ? (
        <Portal>
          <Window
            id={id}
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              zIndex: 3,
            }}
            ref={floating}
          >
            {toolbarState === "filter" ? <Filter model={model.filter} /> : null}
            {toolbarState === "sort" ? <Sort model={model.sort} /> : null}
            {toolbarState === "rowGrouping" ? (
              <RowGrouping model={model.rowGrouping} />
            ) : null}
          </Window>
        </Portal>
      ) : null}
    </Toolbar>
  );
};
