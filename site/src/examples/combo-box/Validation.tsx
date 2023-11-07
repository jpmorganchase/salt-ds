import { ReactElement } from "react";
import { ComboBoxNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { StackLayout } from "@salt-ds/core";

export const Validation = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBoxNext
        defaultValue="Error value"
        validationStatus="error"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color}>
            {color}
          </Option>
        ))}
      </ComboBoxNext>
      <ComboBoxNext
        defaultValue="Warning value"
        validationStatus="warning"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color}>
            {color}
          </Option>
        ))}
      </ComboBoxNext>
      <ComboBoxNext
        defaultValue="Success value"
        validationStatus="success"
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color}>
            {color}
          </Option>
        ))}
      </ComboBoxNext>
    </StackLayout>
  );
};
