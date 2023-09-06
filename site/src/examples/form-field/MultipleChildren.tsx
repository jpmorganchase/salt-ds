import { ChangeEvent, ReactElement, useState } from "react";
import {
  StackLayout,
  Checkbox,
  FormField,
  FlowLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  MultilineInput,
} from "@salt-ds/core";

export const MultipleChildren = (): ReactElement => {
  const [firstValue, setFirstValue] = useState("Five");
  const [secondValue, setSecondValue] = useState("");

  const valid = firstValue.length && secondValue.length;

  const [values, setValues] = useState({
    firstValue: "3",
    secondValue: "4.5",
  });

  const handleUpdate = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    let update = values;
    const value = e.target.value;

    if (parseFloat(value)) {
      if (index === 0) {
        update = {
          firstValue: value,
          secondValue: (parseFloat(value) * 1.5).toString(),
        };
      } else {
        update = {
          firstValue: ((parseFloat(value) * 2) / 3).toString(),
          secondValue: value,
        };
      }
      setValues(update);
    }

    if (value.length === 0) {
      if (index === 0) {
        update = {
          ...values,
          firstValue: value,
        };
      } else {
        update = {
          ...values,
          secondValue: value,
        };
      }
      setValues(update);
    }
  };

  const [checked, setChecked] = useState(false);

  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField validationStatus={valid ? undefined : "error"}>
        <FormFieldLabel>Multi criteria inputs</FormFieldLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input
            value={firstValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFirstValue(e.target.value);
            }}
          />
          <Input
            value={secondValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSecondValue(e.target.value);
            }}
            placeholder="Multiplier"
          />
        </StackLayout>
        <FormFieldHelperText>
          * User must enter all values to complete the input
        </FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Paired fields</FormFieldLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 0)}
            value={values.firstValue}
          />
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 1)}
            value={values.secondValue}
          />
        </StackLayout>
        <FormFieldHelperText>
          * User entry in either field will automatically populate the
          corresponding field with the correct value
        </FormFieldHelperText>
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>Multi inputs with left label</FormFieldLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input placeholder="First value" />
          <Input placeholder="Second value" />
          <Input placeholder="Third value" />
        </StackLayout>
      </FormField>
      <FormField>
        <FormFieldLabel>Multi inputs with secondary variant</FormFieldLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input variant="secondary" placeholder="First value" />
          <Input variant="secondary" placeholder="Second value" />
        </StackLayout>
      </FormField>
      <FormField>
        <FormFieldLabel>Multi controls</FormFieldLabel>
        <StackLayout
          gap={1}
          direction={"row"}
          as="fieldset"
          style={{ margin: "0px", border: "none", padding: "0px" }}
        >
          <Input disabled={checked} placeholder="Transition impact" />
          <Checkbox
            checked={checked}
            onChange={() => setChecked(!checked)}
            label="Transition impact not applicable"
          />
        </StackLayout>
      </FormField>
    </FlowLayout>
  );
};
