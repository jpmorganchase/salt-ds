import type { ResponsiveProp } from "@salt-ds/core";

type SaltButtonStyleProperties = {
  "button-boxShadow"?: string;
  "button-border"?: string;
  "button-height"?: string;
};

type MarketsStyleProperties = {
  "button-background"?: string;
};

type SaltInputStyleProperties = {
  "input-fontSize"?: string;
  "input-boxShadow"?: string;
  "input-height"?: string;
};
type SaltTextSizeProperties = {
  "text-fontSize"?: string;
  "text-fontWeight"?: string;
  "text-lineHeight"?: string;
};
type SaltFormFieldStyleProperties = {
  "formField-gridTemplateColumns"?: string;
};

type SaltFormFieldLabelStyleProperties = {
  "formFieldLabel-lineHeight"?: string;
  "formFieldLabel-paddingRight"?: string;
};

type SystemProperties = {
  "salt-text-action-textTransform"?: "capitalize";
  "salt-palette-corner-weak": "2px"
};

export interface MarketsContract {
  system?: SystemProperties;
  component?: {
    ".saltButton"?: ResponsiveProp<SaltButtonStyleProperties>;
    ".saltButton.buy"?: ResponsiveProp<MarketsStyleProperties>;
    ".saltButton.sell"?: ResponsiveProp<MarketsStyleProperties>;
    ".saltButton.submit"?: ResponsiveProp<MarketsStyleProperties>;
    ".saltButton.salt-size-large"?: ResponsiveProp<SaltButtonStyleProperties>;
    ".saltInput"?: ResponsiveProp<SaltInputStyleProperties>;
    ".saltInput.salt-size-large"?: ResponsiveProp<SaltInputStyleProperties>;
    ".saltText.salt-size-large"?: ResponsiveProp<SaltTextSizeProperties>;
    ".saltFormField"?: ResponsiveProp<SaltFormFieldStyleProperties>;
    ".saltFormFieldLabel-right.saltText"?: ResponsiveProp<SaltFormFieldLabelStyleProperties>;
    ".saltFormFieldLabel.salt-size-large"?: ResponsiveProp<SaltFormFieldLabelStyleProperties>;
  };
}
