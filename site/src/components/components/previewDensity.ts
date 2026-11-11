import { capitalize, type Density } from "@salt-ds/core";
import mobileInterimCss from "@salt-ds/theme/css/experimental/mobile-interim.css?raw";
import { useInsertionEffect } from "react";

export type PreviewDensity = Density | "mobile-interim";

export const previewDensities: PreviewDensity[] = [
  "high",
  "medium",
  "low",
  "touch",
  "mobile",
  "mobile-interim",
];

export function getDensityDisplayName(density: PreviewDensity) {
  if (density === "mobile-interim") {
    return "Mobile (Interim)";
  }

  const label = capitalize(density);
  return density === "touch" ? `${label} (Deprecated)` : label;
}

const mobileInterimClassName = "site-density-mobile-interim";
const mobileInterimStyleId = "site-density-mobile-interim-styles";

// The experimental stylesheet targets every mobile density element, so it's scoped to a class only previews carry.
// Otherwise it would also restyle the site, which uses mobile density on small viewports.
const scopedMobileInterimCss = mobileInterimCss.replaceAll(
  ".salt-density-mobile",
  `.salt-density-mobile.${mobileInterimClassName}`,
);

/**
 * Maps a preview density to the props a `SaltProvider` needs to render it.
 * Mobile (Interim) renders mobile density plus a theme class, which floating UI inherits.
 */
export function usePreviewDensity(density?: PreviewDensity): {
  density?: Density;
  themeClassName?: string;
} {
  const isMobileInterim = density === "mobile-interim";

  useInsertionEffect(() => {
    if (!isMobileInterim || document.getElementById(mobileInterimStyleId)) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = mobileInterimStyleId;
    styleElement.textContent = scopedMobileInterimCss;
    document.head.append(styleElement);
  }, [isMobileInterim]);

  if (density === "mobile-interim") {
    return { density: "mobile", themeClassName: mobileInterimClassName };
  }

  return { density };
}
