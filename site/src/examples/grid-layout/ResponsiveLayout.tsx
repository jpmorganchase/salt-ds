import {
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import responsiveLayoutStyles from "./ResponsiveLayout.module.css";

const columnsOptions = [6, 4, 2, 1];

const getFirstItemColSpan = (columns: number) => {
  if (columns === 6 || columns === 4) {
    return 4;
  }

  if (columns === 2) {
    return 2;
  }

  return 1;
};

export const ResponsiveLayout = (): ReactElement => {
  const [columns, setColumns] = useState(6);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setColumns(Number(value));
  };

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
            value={columns.toString()}
          >
            {columnsOptions.map((columns) => (
              <RadioButton
                key={columns}
                label={columns}
                value={columns.toString()}
              />
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
            colSpan = columns === 1 ? 1 : 2;
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
