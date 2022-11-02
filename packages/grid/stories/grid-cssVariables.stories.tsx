import {
  CellEditor,
  ColumnGroup,
  Grid,
  GridColumn,
  RowKeyGetter,
  TextCellEditor,
} from "../src";
import { ChangeEvent, useMemo, useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@jpmorganchase/uitk-lab";
import {
  Button,
  Checkbox,
  FlexItem,
  FlexLayout,
} from "@jpmorganchase/uitk-core";
import { DeleteIcon, UndoIcon } from "@jpmorganchase/uitk-icons";
import "./grid.stories.css";
import { Story } from "@storybook/react";

export default {
  title: "Grid/New Grid",
  component: Grid,
  argTypes: {},
};

interface GridCssVar {
  name: string;
  value?: string;
  description: string;
}

const cssVarKeyGetter: RowKeyGetter<GridCssVar> = (row: GridCssVar) => row.name;

const CssVariablesTemplate: Story<{}> = () => {
  const variants = [`primary`, `secondary`, `zebra`];
  const [separators, setSeparators] = useState(false);
  const [index, setIndex] = useState(0);
  const [changes, setChanges] = useState<Array<() => void>>([]);

  const [cssVars, setCssVars] = useState<GridCssVar[]>([
    {
      name: "--uitkGrid-row-height",
      description: "Row height",
    },
    {
      name: "--uitkGrid-padding",
      description: "Left and right padding of grid cells and headers",
    },
    {
      name: "--uitkGrid-fontSize",
      description: "Font size for grid cells",
    },
    {
      name: "--uitkGrid-header-fontSize",
      description: "Font size for column headers",
    },
    {
      name: "--grid-groupHeader-fontSize",
      description: "Column group header font size",
    },
    {
      name: "--grid-groupHeader-fontWeight",
      description: "Column group header font weight",
    },
    {
      name: "--uitkGrid-separatorGap",
      description: "Controls the size of the column header separator",
    },
    {
      name: "--uitkGrid-background-primary",
      description: "Background in primary mode",
    },
    {
      name: "--uitkGrid-background-secondary",
      description: "Background in secondary mode",
    },
    {
      name: "--uitkGrid-zebraColor",
      description: "Background color of odd rows in zebra mode",
    },
    {
      name: "--uitkGrid-row-background-hover",
      description: "Background color of the row under the mouse cursor",
    },
    {
      name: "--uitkGrid-row-background-selected",
      description: "Background color of selected rows",
    },
    {
      name: "--uitkGrid-row-borderColor-selected",
      description: "Border color of selected rows",
    },
    {
      name: "--uitkGrid-cell-background-selected",
      description: "Background color of selected cells",
    },
    {
      name: "--uitkGrid-editableCell-borderColor",
      description: "Border color of editable cells",
    },
    {
      name: "--uitkGrid-editableCell-borderColor-hover",
      description: "Border color of the editable cell under the mouse cursor",
    },
    {
      name: "--uitkGrid-editableCell-background-active",
      description: "Background color of editable cells when in edit mode",
    },
    {
      name: "--uitkGrid-editableCell-color-active",
      description: "Font color of editable cells when in edit mode",
    },
    {
      name: "--uitkGrid-editableCell-cornerTag-size",
      description:
        "Size of the triangle element indicating that the focused cell is editable",
    },
    {
      name: "--uitkGrid-header-color",
      description: "Font color applied to column headers",
    },
    {
      name: "--uitkGrid-headerColumnSeparator-color",
      description: "Color of column header separators",
    },
    {
      name: "--uitkGrid-headerRowSeparator-color",
      description:
        "Color of the separator between column headers and grid body",
    },
    {
      name: "--uitkGrid-groupHeaderRowSeparator-color",
      description:
        "Color of the separator between column group headers and column headers",
    },
    {
      name: "--grid-headerRowSeparator-gap",
      description:
        "Size of the gap between the vertical line separating group header from column headers and vertical column separators",
    },
    {
      name: "--grid-headerRowSeparator-height",
      description: "Height (thickness) of the row header separator",
    },
    {
      name: "--uitkGrid-groupHeader-color",
      description: "Foreground color of column group headers",
    },
    {
      name: "--uitkGrid-shadow-color",
      description:
        "Color of the shadow that separates pinned and unpinned columns",
    },
    {
      name: "--uitkGrid-columnDropTarget-color",
      description: "Color of column drop targets",
    },
    {
      name: "--uitkGrid-columnDropTarget-width",
      description: "Width of column drop targets",
    },
    {
      name: "--uitkGrid-cursor-borderColor",
      description: "Keyboard cursor (focused cell) border color",
    },
    {
      name: "--uitkGrid-cursor-borderStyle",
      description: "Keyboard cursor border style",
    },
    {
      name: "--uitkGrid-cursor-borderWidth",
      description: "Width of the keyboard cursor",
    },
    {
      name: "--uitkGrid-borderColor",
      description: "Border color of the grid (when framed)",
    },
    {
      name: "--uitkGrid-rowSeparator-color",
      description: "Color of row separators",
    },
    {
      name: "--uitkGrid-columnSeparator-color",
      description: "Color of column separators (when enabled)",
    },
    {
      name: "--uitkGrid-rowSeparator-color-divided",
      description: "Color of row separators between groups or rows",
    },
    {
      name: "--uitkGrid-columnGhost-borderColor",
      description: "Border color of the column ghost",
    },
    {
      name: "--uitkGrid-columnGhost-borderWidth",
      description: "Border width of the column ghost",
    },
    {
      name: "--uitkGrid-columnGhost-boxShadow",
      description: "Shadow of the column ghost",
    },
  ]);

  const updateCss = (rowIndex: number, value?: string) => {
    setCssVars((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...prev[rowIndex], value };
      return next;
    });
  };

  const onCssVarChange = (row: GridCssVar, rowIndex: number, value: string) => {
    const oldValue = row.value;
    updateCss(rowIndex, value);
    setChanges((old) => {
      const nextChanges = old.slice(old.length - 10);
      nextChanges.push(() => updateCss(rowIndex, oldValue));
      return nextChanges;
    });
  };

  const onUndo = () => {
    const nextChanges = [...changes];
    const change = nextChanges.pop()!;
    setChanges(nextChanges);
    change();
  };

  const onReset = () => {
    setChanges([]);
    setCssVars((old) => old.map((x) => ({ ...x, value: undefined })));
  };

  const style = useMemo(() => {
    return Object.fromEntries(cssVars.map((v) => [v.name, v.value]));
  }, [cssVars]);

  const onVariantChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    setIndex(index);
  };

  const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSeparators(checked);
  };

  return (
    <FlexLayout direction="column">
      <FlexItem>
        <FlexLayout direction="row">
          <FlexItem>
            <ToggleButtonGroup onChange={onVariantChange} selectedIndex={index}>
              <ToggleButton aria-label="primary" tooltipText="Primary">
                Primary
              </ToggleButton>
              <ToggleButton aria-label="secondary" tooltipText="Secondary">
                Secondary
              </ToggleButton>
              <ToggleButton aria-label="zebra" tooltipText="Zebra">
                Zebra
              </ToggleButton>
            </ToggleButtonGroup>
          </FlexItem>
          <FlexItem>
            <Checkbox
              checked={separators}
              label="Column separators"
              onChange={onSeparatorsChange}
            />
          </FlexItem>
          <FlexItem>
            <Button
              variant="secondary"
              onClick={onUndo}
              disabled={changes.length === 0}
            >
              <UndoIcon />
              {` Undo`}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary" onClick={onReset}>
              <DeleteIcon />
              {` Reset`}
            </Button>
          </FlexItem>
        </FlexLayout>
      </FlexItem>
      <Grid
        rowData={cssVars}
        rowKeyGetter={cssVarKeyGetter}
        className="grid-css-customization"
        variant={index === 1 ? "secondary" : "primary"}
        zebra={index === 2 ? true : false}
        columnSeparators={separators}
        style={style}
      >
        <ColumnGroup id="group_one" name="Group One">
          <GridColumn
            name="Name"
            id="name"
            defaultWidth={250}
            getValue={(r) => r.name}
          />
        </ColumnGroup>
        <ColumnGroup id="group_two" name="Group Two">
          <GridColumn
            name="Value"
            id="value"
            getValue={(r) => r.value || ""}
            defaultWidth={200}
            onChange={onCssVarChange}
          >
            <CellEditor>
              <TextCellEditor />
            </CellEditor>
          </GridColumn>
          <GridColumn
            name="Description"
            id="description"
            defaultWidth={500}
            getValue={(r) => r.description}
          />
        </ColumnGroup>
      </Grid>
    </FlexLayout>
  );
};

export const CssVariables = CssVariablesTemplate.bind({});
