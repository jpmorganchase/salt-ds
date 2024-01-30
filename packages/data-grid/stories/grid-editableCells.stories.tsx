import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridColumn,
  NumericCellEditor,
  NumericColumn,
  TextCellEditor,
} from "../src";
import { StoryFn } from "@storybook/react";
import { randomInt, randomNumber, randomText } from "./utils";
import { useCallback, useState } from "react";
import "./grid.stories.css";

export default {
  title: "Lab/Data Grid",
  component: Grid,
  argTypes: {},
};

const discountOptions = ["-", "5%", "10%", "20%", "50%"];
const discountValues = [1, 0.95, 0.9, 0.8, 0.5];

interface RowExample {
  id: string;
  name: string;
  amount: number;
  price: number;
  discount: string;
}

const discountMap: Map<string, number> = new Map(
  discountOptions.map((n, i) => [n, discountValues[i]])
);

const getTotal = (r: RowExample) =>
  r.amount * r.price * discountMap.get(r.discount)!;

const useExampleDataSource = () => {
  const [rows, setRows] = useState<RowExample[]>(() =>
    [...new Array(10).keys()].map((i) => {
      return {
        id: `Row${i + 1}`,
        name: randomText(1, 5, 10),
        amount: randomInt(0, 100),
        price: randomNumber(10, 100, 2),
        discount: "-",
      } as RowExample;
    })
  );

  const setName = useCallback(
    (row: RowExample, rowIndex: number, value: string) => {
      setRows((x) => {
        x = [...x];
        x[rowIndex] = { ...x[rowIndex], name: value };
        return x;
      });
    },
    [setRows]
  );

  const setPrice = useCallback(
    (row: RowExample, rowIndex: number, value: string) => {
      setRows((x) => {
        x = [...x];
        x[rowIndex] = { ...x[rowIndex], price: Number.parseFloat(value) };
        return x;
      });
    },
    [setRows]
  );

  const setAmount = useCallback(
    (row: RowExample, rowIndex: number, value: string) => {
      setRows((x) => {
        x = [...x];
        x[rowIndex] = { ...x[rowIndex], amount: Number.parseInt(value) };
        return x;
      });
    },
    [setRows]
  );

  const setDiscount = useCallback(
    (row: RowExample, rowIndex: number, value: string) => {
      setRows((x) => {
        x = [...x];
        x[rowIndex] = { ...x[rowIndex], discount: value };
        return x;
      });
    },
    [setRows]
  );

  return { rows, setAmount, setName, setDiscount, setPrice };
};

const EditableCellsTemplate: StoryFn<{}> = () => {
  const { setPrice, setDiscount, rows, setAmount, setName } =
    useExampleDataSource();

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={(row) => row.id}
      className="grid"
      zebra={true}
      // columnSeparators={true}
    >
      <GridColumn
        id="name"
        name="Name"
        getValue={(r) => r.name}
        onChange={setName}
        sortable
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setAmount}
        sortable
      >
        <CellEditor>
          <NumericCellEditor />
        </CellEditor>
      </NumericColumn>
      <NumericColumn
        id="price"
        name="Price"
        precision={2}
        getValue={(r: RowExample) => r.price}
        onChange={setPrice}
        sortable
      >
        <CellEditor>
          <NumericCellEditor />
        </CellEditor>
      </NumericColumn>
      <GridColumn
        id="discount"
        name="Discount"
        getValue={(r) => r.discount}
        onChange={setDiscount}
        sortable
      >
        <CellEditor>
          <DropdownCellEditor options={discountOptions} />
        </CellEditor>
      </GridColumn>
      <NumericColumn
        id="total"
        name="Total"
        getValue={getTotal}
        precision={4}
      />
    </Grid>
  );
};

export const EditableCells = EditableCellsTemplate.bind({});
