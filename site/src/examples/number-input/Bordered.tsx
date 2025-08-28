import { NumberInput } from "@salt-ds/lab";

export const Bordered = () => (
  <NumberInput
    defaultValue={0}
    bordered
    onNumberChange={(newValue) => console.log(`Number changed to ${newValue}`)}
    style={{ width: "256px" }}
  />
);
