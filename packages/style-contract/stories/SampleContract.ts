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

type SystemProperties = {
  "salt-text-action-textTransform"?: "capitalize";
};

export interface SampleContract {
  system?: SystemProperties;
  component?: {
    ".saltButton-neutral.saltButton-solid"?: ResponsiveProp<SaltButtonColorProperties>;
    ".saltButton.salt-customizable-size-small"?: ResponsiveProp<SaltButtonSizeProperties>;
    ".saltButton.salt-customizable-size-medium"?: ResponsiveProp<SaltButtonSizeProperties>;
    ".saltButton.salt-customizable-size-large"?: ResponsiveProp<SaltButtonSizeProperties>;
    ".saltButton.salt-customizable-spacing-small"?: ResponsiveProp<SaltButtonSpacingProperties>;
    ".saltButton.salt-customizable-spacing-medium"?: ResponsiveProp<SaltButtonSpacingProperties>;
    ".saltButton.salt-customizable-spacing-large"?: ResponsiveProp<SaltButtonSpacingProperties>;
    ".saltInput"?: ResponsiveProp<SaltInputStyleProperties>;
    ".saltCard"?: ResponsiveProp<SaltCardStyleProperties>;
  };
}
