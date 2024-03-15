import { ReactElement } from "react";
import { ComboBoxNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Validation = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBoxNext
        defaultValue="Error value"
        validationStatus="error"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBoxNext>
      <ComboBoxNext
        defaultValue="Warning value"
        validationStatus="warning"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBoxNext>
      <ComboBoxNext
        defaultValue="Success value"
        validationStatus="success"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBoxNext>
    </StackLayout>
  );
};
