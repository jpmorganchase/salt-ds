import { NumberInput } from "@salt-ds/lab";

export const Default = () => (
  <NumberInput
    defaultValue={0}
    onNumberChange={(newValue) => console.log(`Number changed to ${newValue}`)}
    style={{ width: "256px" }}
  />
);
