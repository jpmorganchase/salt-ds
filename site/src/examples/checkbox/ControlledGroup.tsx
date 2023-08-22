import { ChangeEvent, ReactElement, useState } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const ControlledGroup = (): ReactElement => {
  const checkboxesData = [
    {
      label: "Alternatives",
      value: "alternatives",
    },
    {
      label: "Equities",
      value: "equities",
    },
    {
      disabled: true,
      label: "Fixed income",
      value: "Fixed income",
    },
  ];

  const [controlledValues, setControlledValues] = useState(["equities"]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (controlledValues.indexOf(value) === -1) {
      setControlledValues((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setControlledValues((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
  };
  return (
    <CheckboxGroup checkedValues={controlledValues} onChange={handleChange}>
      {checkboxesData.map((data) => (
        <Checkbox key={data.value} {...data} />
      ))}
    </CheckboxGroup>
  );
};
