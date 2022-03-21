import { Story } from "@storybook/react";
import { useState } from "react";
import { Blotter, BlotterRecord, makeFakeBlotterRecord } from "./grid/blotter";
import {
  ColumnGroupDefinition,
  createNumericColumn,
  createRowSelectionCheckboxColumn,
  createTextColumn,
  DataGrid,
  DataSetColumnDefinition,
  Grid,
} from "@brandname/lab";

export default {
  title: "Lab/Grid",
  component: Grid,
};

const blotter = new Blotter();
for (let i = 0; i < 2000; ++i) {
  const record = makeFakeBlotterRecord();
  record.identifier = `${i}-${record.identifier}`;
  blotter.addRecord(record);
  for (let j = 0; j < 2; ++j) {
    const subRecord = makeFakeBlotterRecord();
    blotter.addRecord(subRecord, record);
    for (let k = 0; k < 2; ++k) {
      const subSubRecord = makeFakeBlotterRecord();
      blotter.addRecord(subSubRecord, subRecord);
    }
  }
}

const columnGroups: ColumnGroupDefinition<BlotterRecord>[] = [
  {
    key: "checkboxGroup",
    title: "Checkbox",
    columns: [createRowSelectionCheckboxColumn()],
    pinned: "left",
  },
  {
    key: "group1",
    title: "Group One",
    columns: [
      createTextColumn("identifier", "Identifier", "identifier", 100),
      createTextColumn("client", "Client", "client", 100),
    ],
    pinned: "left",
  },
  {
    key: "group2",
    title: "Group Two",
    columns: [
      createTextColumn("side", "Side", "side", 200),
      createTextColumn("deskOwner", "Desk Owner", "deskOwner", 200),
      createTextColumn("status", "Status", "status", 200),
    ],
  },
  {
    key: "group3",
    title: "Group Three",
    columns: [createTextColumn("flag", "Flag", "flag", 200)],
  },
  {
    key: "group4",
    title: "Group Four",
    columns: [
      createNumericColumn("quantity", "Quantity", "quantity", 100),
      createNumericColumn("averagePx", "Average Px", "averagePx", 100),
    ],
    pinned: "right",
  },
];

interface BlotterStoryProps {}

const getKey = (record: BlotterRecord) => record.key;

const BlotterStoryTemplate: Story<BlotterStoryProps> = (props) => {
  const [data, setData] = useState<BlotterRecord[]>(
    () => blotter.visibleRecords
  );

  return (
    <Grid data={data} columnGroupDefinitions={columnGroups} getKey={getKey} />
  );
};

export const BlotterExample = BlotterStoryTemplate.bind({});

const dataSetColumnDefinitions: DataSetColumnDefinition[] = [
  {
    key: "identifier",
    type: "tree",
    field: "identifier",
    title: "Identifier",
    pinned: "left",
  },
  {
    type: "text",
    key: "client",
    title: "Client",
    field: "client",
  },
  {
    type: "text",
    key: "side",
    title: "Side",
    field: "side",
  },
  {
    type: "text",
    key: "deskOwner",
    title: "Desk Owner",
    field: "deskOwner",
  },
  {
    type: "numeric",
    key: "quantity",
    title: "Quantity",
    field: "quantity",
  },
  {
    type: "numeric",
    key: "averagePx",
    title: "Average Px",
    field: "averagePx",
    precision: 6,
  },
  {
    type: "price",
    key: "price",
    title: "Price",
    currencyField: "currency",
    amountField: "averagePx",
    precision: 2,
    pinned: "right",
  },
];

const DataSetStoryTemplate: Story<{}> = () => {
  return (
    <DataGrid
      getKey={getKey}
      childrenPropName={"records"}
      columnDefinitions={dataSetColumnDefinitions}
      data={blotter.visibleRecords}
    />
  );
};

export const DataGridExample = DataSetStoryTemplate.bind({});
