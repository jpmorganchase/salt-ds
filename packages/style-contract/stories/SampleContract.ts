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
type SaltTextSizeProperties = {
  "text-fontSize"?: string;
  "text-fontWeight"?: string;
  "text-lineHeight"?: string;
};

type SystemProperties = {
  "salt-text-action-textTransform"?: "capitalize";
};

export interface SampleContract {
  system?: SystemProperties;
  component?: {
    ".saltButton-neutral.saltButton-solid"?: ResponsiveProp<SaltButtonColorProperties>;
    ".saltText"?: ResponsiveProp<SaltTextSizeProperties>;
    "h1.salt-size-small"?: ResponsiveProp<SaltTextSizeProperties>;
    "h1.salt-size-medium"?: ResponsiveProp<SaltTextSizeProperties>;
    "h1.salt-size-large"?: ResponsiveProp<SaltTextSizeProperties>;
    ".saltInput"?: ResponsiveProp<SaltInputStyleProperties>;
    ".saltCard"?: ResponsiveProp<SaltCardStyleProperties>;
  };
}
