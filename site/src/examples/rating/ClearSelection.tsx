import { Button, FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./ClearSelection.module.css";

export const ClearSelection = (): ReactElement => {
  const [value, setValue] = useState<number>(3);
  const [cleared, setCleared] = useState(false);

  return (
    <StackLayout direction="row" align="end" gap={1}>
      <FormField>
        <FormFieldLabel aria-live="polite">
          Rating {cleared && <span className={styles.srOnly}>was cleared</span>}
        </FormFieldLabel>
        <Rating
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
            setCleared(false);
          }}
        />
      </FormField>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => {
          setValue(0);
          setCleared(true);
        }}
        aria-label="Clear rating"
      >
        Clear
      </Button>
    </StackLayout>
  );
};
