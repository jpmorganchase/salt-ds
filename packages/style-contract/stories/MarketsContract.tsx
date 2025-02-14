import type { ResponsiveProp } from "@salt-ds/core";

type SaltInputStyleProperties = {
  "input-boxShadow"?: string;
  "input-height"?: string;
};
type SaltTextSizeProperties = {
  "text-fontSize"?: string;
  "text-fontWeight"?: string;
  "text-lineHeight"?: string;
};
type SaltFormFieldLabelStyleProperties = {
  "formFieldLabel-lineHeight"?: string;
};

type SystemProperties = {
  "salt-text-action-textTransform"?: "capitalize";
};

export interface MarketsContract {
  system?: SystemProperties;
  component?: {
    ".saltInput": ResponsiveProp<SaltInputStyleProperties>;
    ".saltInput.salt-size-large"?: ResponsiveProp<SaltInputStyleProperties>;
    ".saltText.salt-size-large"?: ResponsiveProp<SaltTextSizeProperties>;
    ".saltFormFieldLabel.salt-size-large"?: ResponsiveProp<SaltFormFieldLabelStyleProperties>;
  };
}
