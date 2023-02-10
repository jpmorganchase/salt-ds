import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridCellValueProps,
  GridColumn,
  NumericCellEditor,
  NumericColumn,
  TextCellEditor,
} from "../src";
import { Story } from "@storybook/react";
import { faker } from "@faker-js/faker";
import { useCallback, useState } from "react";
import "./grid.stories.css";
import { StatusIndicator } from "@salt-ds/core";

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
  status?: "error" | "warning" | "success";
}

const discountMap: Map<string, number> = new Map(
  discountOptions.map((n, i) => [n, discountValues[i]])
);
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const getTotal = (r: RowExample) =>
  formatter.format(r.amount * r.price * discountMap.get(r.discount)!);

const useExampleDataSource = () => {
  const [rows, setRows] = useState<RowExample[]>([
    {
      id: "Row1",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.datatype.number({ min: 1, max: 100 }),
      price: faker.datatype.number({ min: 10, max: 2000 }),
      discount: "-",
      status: "error",
    },
    {
      id: "Row2",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.datatype.number({ min: 1, max: 100 }),
      price: faker.datatype.number({ min: 10, max: 2000 }),
      discount: "-",
    },
    {
      id: "Row3",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.datatype.number({ min: 1, max: 100 }),
      price: faker.datatype.number({ min: 10, max: 2000 }),
      discount: "-",
      status: "warning",
    },
    {
      id: "Row4",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.datatype.number({ min: 1, max: 100 }),
      price: faker.datatype.number({ min: 10, max: 2000 }),
      discount: "-",
    },
    {
      id: "Row5",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.datatype.number({ min: 1, max: 100 }),
      price: faker.datatype.number({ min: 10, max: 2000 }),
      discount: "-",
      status: "success",
    },
  ]);

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
        defaultWidth={180}
        getValue={(r) => r.name}
        onChange={setName}
        getValidationStatus={({ row }) => (row.index > 2 ? "error" : undefined)}
        validationType="strong"
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        defaultWidth={200}
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
        getValidationStatus={({ row }) =>
          row.index > 2 ? "warning" : undefined
        }
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
        getValidationStatus={({ row }) => (row.index > 2 ? "error" : undefined)}
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
      <GridColumn
        id="total"
        name="Total"
        getValue={getTotal}
        align="left"
        getValidationStatus={({ row }) => (row.index > 2 ? "error" : undefined)}
      />
    </Grid>
  );
};

const knownStatus = ["error", "warning", "success"];
function RowValidationCell({
  validationStatus,
}: GridCellValueProps<RowExample>) {
  if (!validationStatus || !knownStatus.includes(validationStatus)) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <StatusIndicator
        aria-label={`Row ${validationStatus}`}
        status={validationStatus}
      />
    </div>
  );
}

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
        id="status"
        aria-label="Row status"
        defaultWidth={30}
        getValidationStatus={({ row }) => row.data.status}
        cellValueComponent={RowValidationCell}
      />
      <GridColumn
        id="name"
        name="Name"
        defaultWidth={180}
        getValue={(r) => r.name}
        onChange={setName}
        getValidationStatus={({ row }) => row.data.status}
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="description"
        name="Description"
        defaultWidth={200}
        getValue={(r) => r.description}
        onChange={setName}
        getValidationStatus={({ row }) => row.data.status}
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setAmount}
        getValidationStatus={({ row }) => row.data.status}
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
        getValidationStatus={({ row }) => row.data.status}
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
        getValidationStatus={({ row }) => row.data.status}
      >
        <CellEditor>
          <DropdownCellEditor options={discountOptions} />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="total"
        name="Total"
        getValue={getTotal}
        align="left"
        getValidationStatus={({ row }) => row.data.status}
      />
    </Grid>
  );
};
