import { ReactElement } from "react";
import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Validation = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBox
        defaultValue="Error value"
        validationStatus="error"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox
        defaultValue="Warning value"
        validationStatus="warning"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox
        defaultValue="Success value"
        validationStatus="success"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
    </StackLayout>
  );
};
