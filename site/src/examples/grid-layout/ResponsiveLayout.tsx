import { ReactElement, useState, ChangeEventHandler } from "react";
import {
  GridLayout,
  GridItem,
  FormField,
  FormFieldLabel,
  RadioButtonGroup,
  RadioButton,
} from "@salt-ds/core";
import styles from "./index.module.css";
import responsiveLayoutStyles from "./ResponsiveLayout.module.css";

const availableColumns = [6, 4, 2, 1];

const columnsOptions = availableColumns.map((columns, index) => ({
  label: columns,
  value: `option${index + 1}`,
}));

const getFirstItemColSpan = (columns: number) => {
  if (columns === 6 || columns === 4) {
    return 4;
  }

  if (columns === 2) {
    return 2;
  }

  return 1;
};

const getSecondItemColSpan = (columns: number) => {
  if (columns === 1) {
    return 1;
  }

  return 2;
};

export const ResponsiveLayout = (): ReactElement => {
  const [option, setOption] = useState("option1");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setOption(value);
  };

  const columns =
    columnsOptions.find(({ value }) => value === option)?.label || 6;

  return (
    <div className={responsiveLayoutStyles.container}>
      <div className={responsiveLayoutStyles.radioButtonGroup}>
        <FormField>
          <FormFieldLabel>Columns</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Columns Controls"
            name="columns"
            onChange={handleChange}
            value={option}
          >
            {columnsOptions.map(({ label, value }) => (
              <RadioButton key={value} label={label} value={value} />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
      <GridLayout columns={columns} rows={2}>
        {Array.from({ length: 8 }, (_, index) => {
          let colSpan = 1;

          if (index === 0) {
            colSpan = getFirstItemColSpan(columns);
          }

          if (index === 1) {
            colSpan = getSecondItemColSpan(columns);
          }

          return (
            <GridItem key={index} colSpan={colSpan} className={styles.gridItem}>
              <p>{index + 1}</p>
            </GridItem>
          );
        })}
      </GridLayout>
    </div>
  );
};
