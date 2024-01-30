import {
  CellEditor,
  ColumnGroup,
  Grid,
  GridColumn,
  RowKeyGetter,
  TextCellEditor,
} from "../src";
import { ChangeEvent, SyntheticEvent, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  FlexItem,
  FlexLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { DeleteIcon, UndoIcon } from "@salt-ds/icons";
import "./grid.stories.css";
import { StoryFn } from "@storybook/react";

type Variant = "primary" | "secondary" | "zebra";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

interface GridCssVar {
  name: string;
  value?: string;
  description: string;
}

const cssVarKeyGetter: RowKeyGetter<GridCssVar> = (row: GridCssVar) => row.name;

const CssVariablesTemplate: StoryFn<{}> = () => {
  const [separators, setSeparators] = useState(false);
  const [pinnedSeparators, setPinnedSeparators] = useState(true);
  const [variant, setVariant] = useState<Variant>("primary");
  const [changes, setChanges] = useState<Array<() => void>>([]);

  const [cssVars, setCssVars] = useState<GridCssVar[]>([
    {
      name: "--saltGrid-row-height",
      description: "Row height",
    },
    {
      name: "--saltGrid-padding",
      description: "Left and right padding of grid cells and headers",
    },
    {
      name: "--saltGrid-fontSize",
      description: "Font size for grid cells",
    },
    {
      name: "--saltGrid-header-fontSize",
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
      name: "--saltGrid-separatorGap",
      description: "Controls the size of the column header separator",
    },
    {
      name: "--saltGrid-background-primary",
      description: "Background in primary mode",
    },
    {
      name: "--saltGrid-background-secondary",
      description: "Background in secondary mode",
    },
    {
      name: "--saltGrid-zebraColor",
      description: "Background color of odd rows in zebra mode",
    },
    {
      name: "--saltGrid-row-background-hover",
      description: "Background color of the row under the mouse cursor",
    },
    {
      name: "--saltGrid-row-background-selected",
      description: "Background color of selected rows",
    },
    {
      name: "--saltGrid-row-borderColor-selected",
      description: "Border color of selected rows",
    },
    {
      name: "--saltGrid-cell-background-selected",
      description: "Background color of selected cells",
    },
    {
      name: "--saltGrid-editableCell-borderColor",
      description: "Border color of editable cells",
    },
    {
      name: "--saltGrid-editableCell-borderColor-hover",
      description: "Border color of the editable cell under the mouse cursor",
    },
    {
      name: "--saltGrid-editableCell-background-active",
      description: "Background color of editable cells when in edit mode",
    },
    {
      name: "--saltGrid-editableCell-color-active",
      description: "Font color of editable cells when in edit mode",
    },
    {
      name: "--saltGrid-editableCell-cornerTag-size",
      description:
        "Size of the triangle element indicating that the focused cell is editable",
    },
    {
      name: "--saltGrid-header-color",
      description: "Font color applied to column headers",
    },
    {
      name: "--saltGrid-headerColumnSeparator-color",
      description: "Color of column header separators",
    },
    {
      name: "--saltGrid-headerRowSeparator-color",
      description:
        "Color of the separator between column headers and grid body",
    },
    {
      name: "--saltGrid-groupHeaderRowSeparator-color",
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
      name: "--saltGrid-groupHeader-color",
      description: "Foreground color of column group headers",
    },
    {
      name: "--saltGrid-shadow-color",
      description:
        "Color of the shadow that separates pinned and unpinned columns",
    },
    {
      name: "--saltGrid-columnDropTarget-color",
      description: "Color of column drop targets",
    },
    {
      name: "--saltGrid-columnDropTarget-width",
      description: "Width of column drop targets",
    },
    {
      name: "--saltGrid-cursor-borderColor",
      description: "Keyboard cursor (focused cell) border color",
    },
    {
      name: "--saltGrid-cursor-borderStyle",
      description: "Keyboard cursor border style",
    },
    {
      name: "--saltGrid-cursor-borderWidth",
      description: "Width of the keyboard cursor",
    },
    {
      name: "--saltGrid-borderColor",
      description: "Border color of the grid (when framed)",
    },
    {
      name: "--saltGrid-rowSeparator-color",
      description: "Color of row separators",
    },
    {
      name: "--saltGrid-columnSeparator-color",
      description: "Color of column separators (when enabled)",
    },
    {
      name: "--saltGrid-pinnedSeparator-color",
      description: "Color of the separator between pinned and unpinned columns",
    },
    {
      name: "--saltGrid-rowSeparator-color-divided",
      description: "Color of row separators between groups or rows",
    },
    {
      name: "--saltGrid-columnGhost-borderColor",
      description: "Border color of the column ghost",
    },
    {
      name: "--saltGrid-columnGhost-borderWidth",
      description: "Border width of the column ghost",
    },
    {
      name: "--saltGrid-columnGhost-boxShadow",
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

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setVariant(event.currentTarget.value as Variant);
  };

  const onSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSeparators(checked);
  };

  const onPinnedSeparatorsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setPinnedSeparators(checked);
  };

  return (
    <FlexLayout direction="column">
      <FlexItem>
        <FlexLayout direction="row">
          <FlexItem>
            <ToggleButtonGroup onChange={onVariantChange} value={variant}>
              <ToggleButton value="primary">Primary</ToggleButton>
              <ToggleButton value="secondary">Secondary</ToggleButton>
              <ToggleButton value="zebra">Zebra</ToggleButton>
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
            <Checkbox
              checked={pinnedSeparators}
              label="Pinned column separators"
              onChange={onPinnedSeparatorsChange}
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
        variant={variant !== "zebra" ? variant : "primary"}
        zebra={variant === "zebra"}
        columnSeparators={separators}
        pinnedSeparators={pinnedSeparators}
        style={style}
      >
        <ColumnGroup id="group_one" name="Group One" pinned="left">
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
