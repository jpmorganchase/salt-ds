import type { ResponsiveProp } from "@salt-ds/core";

type SystemProperties = {
  "salt-text-action-textTransform"?: "capitalize";
};

export interface RillaboomContract {
  system?: ResponsiveProp<SystemProperties>;
}
