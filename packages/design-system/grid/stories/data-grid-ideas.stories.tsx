import { Story } from "@storybook/react";
import {
  ColDef,
  DataGrid,
  DataGridRowGroupLevelSettings,
  DataGridRowGroupSettings,
  Filter,
  FilterColumn,
  FilterModel,
} from "../src";
import "./data-grid-ideas.stories.css";
import { useMemo, useState } from "react";
import { GridToolbar, GridToolbarModel } from "../src/data-grid/toolbar";
import {
  ListCellValue,
  NumericColumnData,
  NumericColumnHeader,
} from "../src/data-grid/column-types";
import { PillCellValue, NumericCellValue } from "../src/data-grid/column-types";
import {
  DataGridSettings,
  DataGridSettingsModel,
} from "./grid/data-grid-settings/DataGridSettings";
import { randomAmount } from "./grid/utils";

export default {
  title: "Grid/Data Grid Ideas",
  component: DataGrid,
  argTypes: {
    // showTreeLines: { control: "boolean" },
    // rowGrouping: {
    //   control: "select",
    //   options: [...rowGroupingOptions.keys()],
    // },
  },
};

interface Investor {
  name: string;
  addedInvestors: string[];
  location: string;
  strategy: string[];
  cohort: string[];
  notes: string;
  amount: number;
}

function createDummyInvestors(): Investor[] {
  const a = [
    "Apple",
    "Orange",
    "Dragonfruit",
    "Coffee",
    "Fig",
    "Grape",
    "Hazelnut",
  ];
  const b = ["Investment", "Venture Capital", "Private Wealth"];
  const c = ["", "Inc."];
  const loc = [
    "New York, NY",
    "Jersey City, NJ",
    "Boston, MA",
    "San Francisco, CA",
  ];
  const str = [
    ["FO"],
    ["PE"],
    ["VC"],
    ["FO", "PE"],
    ["FO", "PE", "VC"],
    ["VC", "PE"],
  ];
  const coh = [
    ["Potential Leads"],
    ["Top VCs"],
    ["Potential Leads", "Top VCs"],
  ];

  const investors: Investor[] = [];
  let i = 0;
  for (let x of a) {
    for (let y of b) {
      for (let z of c) {
        investors.push({
          name: [x, y, z].join(" "),
          addedInvestors: [],
          location: loc[i % loc.length],
          cohort: coh[i % coh.length],
          strategy: str[i % str.length],
          notes: "",
          amount: randomAmount(100, 300, 4),
        });
        ++i;
      }
    }
  }

  return investors;
}

const columnDefinitions: ColDef<Investor>[] = [
  {
    key: "name",
    type: "text",
    field: "name",
    title: "Name",
    pinned: "left",
  },
  // TODO createNumericColDef(key, type, field, title, precision)?
  {
    key: "amount",
    type: "number",
    field: "amount",
    title: "Amount",
    cellComponent: NumericCellValue,
    headerComponent: NumericColumnHeader,
    headerClassName: "uitkDataGridNumericColumnHeader",
    data: {
      precision: 4,
    } as NumericColumnData,
  },
  {
    key: "addedInvestors",
    type: "multiList",
    field: "addedInvestors",
    title: "Added Investors",
  },
  {
    key: "location",
    type: "text",
    field: "location",
    title: "Location",
  },
  {
    key: "strategy",
    type: "multiList",
    field: "strategy",
    title: "Strategy",
    cellComponent: ListCellValue,
  },
  {
    key: "cohort",
    type: "multiList",
    field: "cohort",
    title: "Cohort",
    cellComponent: PillCellValue,
  },
  {
    key: "notes",
    type: "text",
    field: "notes",
    title: "Notes",
  },
];

const filterColumns: FilterColumn<Investor>[] = columnDefinitions.map((c) => {
  return {
    name: c.title || c.field,
    field: c.field as keyof Investor,
  };
});

const dummyInvestors = createDummyInvestors();

const rowKeyGetter = (rowData: Investor) => rowData.name;

interface DataGridStoryProps {
  showTreeLines: boolean;
  rowGrouping: string;
}

const DataGridStoryTemplate: Story<DataGridStoryProps> = (props) => {
  const [toolbarModel] = useState<GridToolbarModel<Investor>>(
    () => new GridToolbarModel(filterColumns)
  );
  const [dataGridSettingsModel] = useState<DataGridSettingsModel>(
    () => new DataGridSettingsModel()
  );

  const filterFn = toolbarModel.filter.useFilterFn();
  const sortFn = toolbarModel.sort.useSortFn();
  const sortSettings = toolbarModel.sort.useSortSettings();
  const groupByColumns = toolbarModel.rowGrouping.useRowGroupingSettings();

  const rowGrouping: DataGridRowGroupSettings<Investor> | undefined =
    useMemo(() => {
      if (groupByColumns == undefined || groupByColumns.length === 0) {
        return undefined;
      }
      return {
        title: "Group",
        width: 100,
        showTreeLines: true,
        groupLevels: groupByColumns.map((x) => {
          return {
            field: x.field,
          } as DataGridRowGroupLevelSettings<Investor>;
        }),
        pinned: "left",
      };
    }, [groupByColumns]);

  const backgroundVariant = dataGridSettingsModel.backgroundVariant.useValue();
  const isFramed = dataGridSettingsModel.frame.useValue();
  const rowDividerField = dataGridSettingsModel.rowDividers.useValue()
    ? "location"
    : undefined;

  console.log(`Rendering with rowDividerField = ${rowDividerField}`);

  return (
    <div className={"gridStory"}>
      <GridToolbar model={toolbarModel} />
      <DataGrid
        className={"grid"}
        rowKeyGetter={rowKeyGetter}
        data={dummyInvestors}
        columnDefinitions={columnDefinitions}
        filterFn={filterFn}
        sortFn={sortFn}
        sortSettings={sortSettings}
        rowGrouping={rowGrouping}
        leafNodeGroupNameField={"name"}
        backgroundVariant={backgroundVariant}
        isFramed={isFramed}
        rowDividerField={rowDividerField}
      />
      <DataGridSettings model={dataGridSettingsModel} />
    </div>
  );
};

const FilterStoryTemplate: Story<{}> = () => {
  const [model] = useState(() => new FilterModel<Investor>(filterColumns));
  return <Filter model={model} />;
};

const ToolbarStoryTemplate: Story<{}> = () => {
  const [toolbarModel] = useState<GridToolbarModel<Investor>>(
    () => new GridToolbarModel(filterColumns)
  );
  return <GridToolbar model={toolbarModel} />;
};

export const DataGridExample = DataGridStoryTemplate.bind({});

DataGridExample.args = {};

export const FilterExample = FilterStoryTemplate.bind({});

FilterExample.args = {};

export const ToolbarExample = ToolbarStoryTemplate.bind({});

ToolbarExample.args = {};
