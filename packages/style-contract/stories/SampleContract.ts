import type { ResponsiveProp } from "@salt-ds/core";

type SaltButtonColorProperties = {
  "button-color-default"?: "white" | "grey" | "black";
  "button-color-hover"?: "white" | "grey" | "black";
  "button-color-active"?: "white" | "grey" | "black";
  "button-color-disabled"?: "white" | "grey" | "black";
  "button-background-default"?: "red" | "green" | "blue";
  "button-background-hover"?: "red" | "green" | "blue";
  "button-background-active"?: "red" | "green" | "blue";
  "button-background-disabled"?: "red" | "green" | "blue";
};

type SaltButtonSizeProperties = {
  "button-height"?: string;
};

type SaltButtonSpacingProperties = {
  "button-padding"?: string;
};

type SaltInputStyleProperties = {
  "input-height"?: string;
  "input-fontSize"?: string;
  "input-color"?: "white" | "grey" | "black";
  "input-borderColor-default"?: "red" | "green" | "blue";
  "input-borderColor-hover"?: "red" | "green" | "blue";
  "input-borderColor-active"?: "red" | "green" | "blue";
  "input-borderColor-disabled"?: "red" | "green" | "blue";
  "input-background-default"?: "red" | "green" | "blue";
  "input-background-hover"?: "red" | "green" | "blue";
  "input-background-active"?: "red" | "green" | "blue";
  "input-background-disabled"?: "red" | "green" | "blue";
};

type SaltCardStyleProperties = {
  "salt-card-background"?: string;
  "salt-card-border"?: string;
};

type SaltButtonColorSchema = ResponsiveProp<SaltButtonColorProperties>;
type SaltButtonSizeSchema = ResponsiveProp<SaltButtonSizeProperties>;
type SaltButtonSpacingSchema = ResponsiveProp<SaltButtonSpacingProperties>;
type SaltInputStyleSchema = ResponsiveProp<SaltInputStyleProperties>;
type SaltCardStyleSchema = ResponsiveProp<SaltCardStyleProperties>;

export interface SampleContract {
  ".saltButton"?: SaltButtonColorSchema;
  ".saltButton-neutral.saltButton-solid"?: SaltButtonColorSchema;
  ".saltButton.salt-customizable-size-small"?: SaltButtonSizeSchema;
  ".saltButton.salt-customizable-size-medium"?: SaltButtonSizeSchema;
  ".saltButton.salt-customizable-size-large"?: SaltButtonSizeSchema;
  ".saltButton.salt-customizable-spacing-small"?: SaltButtonSpacingSchema;
  ".saltButton.salt-customizable-spacing-medium"?: SaltButtonSpacingSchema;
  ".saltButton.salt-customizable-spacing-large"?: SaltButtonSpacingSchema;
  ".saltInput"?: SaltInputStyleSchema;
  ".saltCard"?: SaltCardStyleSchema;
}
