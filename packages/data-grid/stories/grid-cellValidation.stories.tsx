import {
  CellEditor,
  DropdownCellEditor,
  Grid,
  GridColumn,
  NumericCellEditor,
  NumericColumn,
  TextCellEditor,
  CellValidationState,
  GridColumnProps,
  RowSelectionCheckboxColumn,
} from "../src";
import { StoryFn } from "@storybook/react";
import * as yup from "yup";
import { faker } from "@faker-js/faker";
import { useCallback, useState } from "react";
import "./grid.stories.css";
import { RowValidationStatusColumn } from "../src/RowValidationStatus";

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
  status?: CellValidationState;
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
      amount: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 2000 }),
      discount: "-",
      status: "error",
    },
    {
      id: "Row2",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 2000 }),
      discount: "-",
    },
    {
      id: "Row3",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 2000 }),
      discount: "-",
      status: "warning",
    },
    {
      id: "Row4",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 2000 }),
      discount: "-",
    },
    {
      id: "Row5",
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      amount: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 2000 }),
      discount: "-",
      status: "success",
    },
  ]);

  const setValue = useCallback(
    ({
      rowIndex,
      name,
      value,
    }: {
      rowIndex: number;
      value: string | number;
      name: EditableFieldKeys;
    }) => {
      setRows((x) => {
        x = [...x];
        x[rowIndex] = { ...x[rowIndex], [name]: value };
        return x;
      });
    },
    [setRows]
  );

  return { rows, setValue };
};

const validationSchema = yup.object({
  name: yup.string().required().min(3),
  price: yup.number().required().min(10).max(2000),
  amount: yup.number().required().min(10).max(2000),
  total: yup.number().required().min(10).max(2000),
  discount: yup.string(),
});

type EditableFieldKeys = "name" | "price" | "amount" | "total" | "discount";
type CreateValueSetter = (
  name: EditableFieldKeys
) => GridColumnProps<RowExample>["onChange"];

export const CellValidation: StoryFn = () => {
  const { rows, setValue } = useExampleDataSource();
  const [validationStatus, setValidationStatus] = useState<
    Array<{
      price?: CellValidationState;
      amount?: CellValidationState;
      total?: CellValidationState;
      name?: CellValidationState;
      discount?: CellValidationState;
    }>
  >(() =>
    rows.map((_, index) => {
      if (index > 2) {
        return {
          price: "success",
          amount: "warning",
          total: "error",
          name: "error",
          discount: undefined,
        };
      }
      return {};
    })
  );

  const setNumberValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value: Number.parseFloat(value) });
    asyncValidate({ value, index, name });
  };

  const setStringValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value });
    asyncValidate({ value, index, name });
  };

  const asyncValidate = ({
    value,
    name,
    index,
  }: {
    value: number | string;
    index: number;
    name: EditableFieldKeys;
  }) => {
    validationSchema
      .validateAt(name, { [name]: value })
      .then(() => {
        setValidationStatus((s) => {
          const copy = [...s];
          copy[index][name] = "success";
          return copy;
        });
      })
      .catch(() => {
        setValidationStatus((s) => {
          const copy = [...s];
          copy[index][name] = "error";
          return copy;
        });
      });
  };
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
        getValue={(r: RowExample) => r.name}
        onChange={setStringValue("name")}
        getValidationStatus={({ row }) => validationStatus[row.index].name}
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
        getValue={(r: RowExample) => r.description}
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setNumberValue("amount")}
        getValidationStatus={({ row }) => validationStatus[row.index].amount}
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
        onChange={setNumberValue("price")}
        getValidationMessage={() =>
          "This is a custom success validation message"
        }
        getValidationStatus={({ row }) => validationStatus[row.index].price}
        validationType="strong"
      >
        <CellEditor>
          <NumericCellEditor />
        </CellEditor>
      </NumericColumn>
      <GridColumn
        id="discount"
        name="Discount"
        getValue={(r: RowExample) => r.discount}
        onChange={setStringValue("discount")}
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
        getValidationStatus={({ row }) => validationStatus[row.index].total}
      />
    </Grid>
  );
};

export const RowValidation: StoryFn = () => {
  const { rows, setValue } = useExampleDataSource();

  const setNumberValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value: Number.parseFloat(value) });
  };

  const setStringValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value });
  };

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={(row) => row.id}
      className="grid"
      columnSeparators
      rowSelectionMode="multi"
      getRowValidationStatus={(row) => row.data.status}
    >
      <RowSelectionCheckboxColumn id="selection" />
      <RowValidationStatusColumn
        id="status"
        aria-label="Row status"
        defaultWidth={30}
      />
      <GridColumn
        id="name"
        name="Name"
        defaultWidth={180}
        getValue={(r) => r.name}
        onChange={setStringValue("name")}
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="description"
        name="Description"
        defaultWidth={200}
        getValue={(r: RowExample) => r.description}
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setNumberValue("amount")}
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
        onChange={setNumberValue("price")}
      >
        <CellEditor>
          <NumericCellEditor />
        </CellEditor>
      </NumericColumn>
      <GridColumn
        id="discount"
        name="Discount"
        getValue={(r) => r.discount}
        onChange={setStringValue("discount")}
      >
        <CellEditor>
          <DropdownCellEditor options={discountOptions} />
        </CellEditor>
      </GridColumn>
      <GridColumn id="total" name="Total" getValue={getTotal} align="left" />
    </Grid>
  );
};

export const CellAndRowValidation: StoryFn = () => {
  const { rows, setValue } = useExampleDataSource();
  const setNumberValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value: Number.parseFloat(value) });
  };

  const setStringValue: CreateValueSetter = (name) => (_, index, value) => {
    setValue({ name, rowIndex: index, value });
  };

  return (
    <Grid
      rowData={rows}
      rowKeyGetter={(row) => row.id}
      className="grid"
      columnSeparators
      rowSelectionMode="multi"
      getRowValidationStatus={(row) => row.data.status}
    >
      <RowSelectionCheckboxColumn id="selection" />
      <RowValidationStatusColumn
        id="status"
        aria-label="Row status"
        defaultWidth={30}
      />
      <GridColumn
        id="name"
        name="Name"
        defaultWidth={180}
        getValue={(r) => r.name}
        onChange={setStringValue("name")}
      >
        <CellEditor>
          <TextCellEditor />
        </CellEditor>
      </GridColumn>
      <GridColumn
        id="description"
        name="Description"
        defaultWidth={200}
        getValue={(r: RowExample) => r.description}
      />

      <NumericColumn
        id="amount"
        name="Amount"
        getValue={(r: RowExample) => r.amount}
        precision={0}
        onChange={setNumberValue("amount")}
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
        onChange={setNumberValue("price")}
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
        onChange={setStringValue("discount")}
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
        validationType="strong"
      />
    </Grid>
  );
};
