/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { JSONByScope, JSONObj } from "@jpmorganchase/theme-editor";
import allThemeJson from "./theme/all.json";

const themeWithCharacteristics: JSONObj = allThemeJson as unknown as JSONObj;

const buttonCtaJson: JSONObj = JSON.parse(
  `{
  "uitk": {
    "button" : {
      "background": {
        "value": "{uitk.actionable.cta.background}",
        "type": "color"
      },
      "text-color": {
        "value": "{uitk.actionable.cta.text-color}",
        "type": "color"
      }
    }
  }
}
`
);

const buttonPrimaryJson: JSONObj = JSON.parse(
  `{
  "uitk": {
    "button" : {
      "background": {
        "value": "{uitk.actionable.primary.background}",
        "type": "color"
      }
    }
  }
}
`
);

const buttonSecondaryJson: JSONObj = JSON.parse(
  `{
  "uitk": {
    "button" : {
      "background": {
        "value": "{uitk.actionable.secondary.background}",
        "type": "color"
      }
    }
  }
}
`
);

export const experimentTheme: JSONByScope[] = [
  { scope: "mode-all", jsonObj: themeWithCharacteristics },
  { scope: "Button-cta", jsonObj: buttonCtaJson },
  { scope: "Button-primary", jsonObj: buttonPrimaryJson },
  { scope: "Button-secondary", jsonObj: buttonSecondaryJson },
];

/**
   * If scope is set to "button", auto generated will be like below
   * ".uitk-button {
      --uitk-button-cta-background: var(--uitk-actionable-cta-background);
    }"

    Our target is something like below

    .uitkButton-cta {
      --button-background: var(--uitk-actionable-cta-background);
    }
   */
