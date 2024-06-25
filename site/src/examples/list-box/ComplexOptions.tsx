import { Option, ListBox, Text, StackLayout } from "@salt-ds/core";
import { ReactElement } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { shortColorWithHex } from "./exampleData";

export const ComplexOptions = (): ReactElement => {
  return (
    <ListBox style={{ width: "10em" }}>
      {shortColorWithHex.slice(0, 5).map(({ color, hex }) => (
        <Option value={color} key={color}>
          <StackLayout gap={0.5} align="start">
            <Text>
              <strong>{color}</strong>
            </Text>
            <Text styleAs="label" color="secondary">
              {hex}
            </Text>
          </StackLayout>
        </Option>
      ))}
    </ListBox>
  );
};
