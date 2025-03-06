import type { ResponsiveProp } from "@salt-ds/core";

type SystemProperties = {};

type SaltAlphaCardProperties = {
  "card-background"?:
    | "rgba(255, 255, 255, 0.3)"
    | "rgba(255, 255, 255, 0.2)"
    | "rgba(255, 255, 255, 0.1)"
    | "rgba(0, 0, 0, 0.3)"
    | "rgba(0, 0, 0, 0.2)"
    | "rgba(0, 0, 0, 0.1)"
    | "none";
  "card-border-color"?:
    | "rgba(255, 255, 255, 0.3)"
    | "rgba(255, 255, 255, 0.2)"
    | "rgba(255, 255, 255, 0.1)"
    | "rgba(0, 0, 0, 0.3)"
    | "rgba(0, 0, 0, 0.2)"
    | "rgba(0, 0, 0, 0.1)"
    | "none";
  "card-padding"?:
    | "var(--salt-spacing-0)"
    | "var(--salt-spacing-100)"
    | "var(--salt-spacing-200)"
    | "var(--salt-spacing-300)";
  "card-border-radius"?:
    | "var(--salt-curve-150)"
    | "var(--salt-curve-200)"
    | "var(--salt-curve-250)";
  "card-box-shadow"?: "0px 2px 4px 0px var(--salt-shadow-200-color)" | "none";
  "card-border-width"?: "var(--salt-size-border)";
};

export interface AlphaCardContract {
  system?: SystemProperties;
  component?: {
    '[data-mode="dark"] .saltCard.saltCard-primary'?: ResponsiveProp<SaltAlphaCardProperties>;
    '[data-mode="dark"] .saltCard.saltCard-secondary'?: ResponsiveProp<SaltAlphaCardProperties>;
    '[data-mode="dark"] .saltCard.saltCard-tertiary'?: ResponsiveProp<SaltAlphaCardProperties>;
    '[data-mode="light"] .saltCard.saltCard-primary'?: ResponsiveProp<SaltAlphaCardProperties>;
    '[data-mode="light"] .saltCard.saltCard-secondary'?: ResponsiveProp<SaltAlphaCardProperties>;
    '[data-mode="light"] .saltCard.saltCard-tertiary'?: ResponsiveProp<SaltAlphaCardProperties>;
  };
}
