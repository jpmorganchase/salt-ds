import { NumberInput } from "@salt-ds/core";

export const Default = () => (
  <NumberInput
    defaultValue={0}
    onNumberChange={(_event, newValue) =>
      console.log(`Number changed to ${newValue}`)
    }
    style={{ width: "256px" }}
  />
);
