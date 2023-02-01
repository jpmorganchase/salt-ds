import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridColumn,
  NumericCellEditor,
  NumericColumn,
  TextCellEditor,
} from "../src";
import { Story } from "@storybook/react";
import { randomInt, randomNumber, randomText } from "./utils";
import { useCallback, useState } from "react";
import "./grid.stories.css";

export default {
  title: "Data Grid/Data Grid",
  component: GridColumn,
  argTypes: {},
};

const discountOptions = ["-", "5%", "10%", "20%", "50%"];
const discountValues = [1, 0.95, 0.9, 0.8, 0.5];

interface RowExample {
  id: string;
  name: string;
  description: string;
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
  const [rows, setRows] = useState<RowExample[]>(
    () =>
      [...new Array(10).keys()].map((i) => {
        return {
          id: `Row${i + 1}`,
          name: randomText(1, 5, 10),
          description: randomText(1, 5, 10),
          amount: randomInt(0, 100),
          price: randomNumber(10, 100, 2),
          discount: "-",
        };
      }) as RowExample[]
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

export const CellValidation: Story = () => {
  const { setPrice, setDiscount, rows, setAmount, setName } =
    useExampleDataSource();

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={(row) => row.id}
      className="grid"
      zebra={true}
      columnSeparators
    >
      <GridColumn
        id="name"
        name="Name"
        getValue={(r) => r.name}
        onChange={setName}
        getValidationStatus={({ row }) => (row.index > 4 ? "error" : "none")}
        validationType="strong"
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="description"
        name="Description"
        getValue={(r) => r.description}
        onChange={setName}
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setAmount}
        getValidationStatus={({ row }) => (row.index > 4 ? "warning" : "none")}
        validationType="strong"
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
        getValidationMessage={() => "This is a custom validation error message"}
        getValidationStatus={({ row }) => (row.index > 4 ? "error" : "none")}
        validationType="strong"
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
        getValidationStatus={({ row }) => (row.index > 4 ? "error" : "none")}
      />
    </Grid>
  );
};

export const RowValidation: Story = () => {
  const { setPrice, setDiscount, rows, setAmount, setName } =
    useExampleDataSource();

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={(row) => row.id}
      className="grid"
      columnSeparators
    >
      <GridColumn
        id="name"
        name="Name"
        getValue={(r) => r.name}
        onChange={setName}
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="description"
        name="Description"
        getValue={(r) => r.description}
        onChange={setName}
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setAmount}
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
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
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
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
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
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
        getValidationStatus={({ row }) =>
          row.index % 2 ? (row.index > 4 ? "error" : "warning") : "none"
        }
      />
    </Grid>
  );
};
