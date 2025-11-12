import { NumberInput } from "@salt-ds/core";

export const Bordered = () => (
  <NumberInput
    defaultValue={0}
    bordered
    onNumberChange={(_event, newValue) =>
      console.log(`Number changed to ${newValue}`)
    }
    style={{ width: "256px" }}
  />
);
