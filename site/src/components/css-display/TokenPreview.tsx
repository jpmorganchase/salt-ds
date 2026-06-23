import { SaltProvider, SaltProviderNext } from "@salt-ds/core";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { Code } from "../mdx/code";
import styles from "./AllTokens.module.css";
import { formatTokenValue } from "./formatTokenValue";
import type { Density } from "./TokenTable";
import { getPreviewType, getSwatchStyle } from "./tokenPreviewUtils";

export function TokenPreview({
  name,
  value,
  density,
  mode,
  themeKey,
  theme,
}: {
  name: string;
  value: string;
  density: Density;
  mode: "light" | "dark";
  themeKey: string;
  theme: "next" | "legacy";
}) {
  const type = getPreviewType(name, value);
  const [isTransparent, setIsTransparent] = useState(false);
  const swatchRef = useRef<HTMLDivElement | null>(null);
  const ThemeProvider = theme === "next" ? SaltProviderNext : SaltProvider;
  const swatchVersion = `${themeKey}:${density}:${value}`;

  useEffect(() => {
    if (type !== "color") {
      setIsTransparent(false);
      return;
    }

    const node = swatchRef.current;
    if (!node) {
      return;
    }

    if (node.dataset.swatchVersion !== swatchVersion) {
      return;
    }

    const backgroundColor = window.getComputedStyle(node).backgroundColor;

    setIsTransparent(isTransparentColor(backgroundColor));
  }, [swatchVersion, type]);

  if (type === "raw") {
    return (
      <div className={styles.codeWrapper}>
        <Code>{formatTokenValue(value)}</Code>
      </div>
    );
  }

  return (
    <div className={styles.swatch}>
      <ThemeProvider
        theme=""
        density={density}
        mode={mode}
        applyClassesTo="child"
      >
        <div
          ref={swatchRef}
          data-swatch-version={swatchVersion}
          className={clsx(styles.swatchInner, getSwatchClassName(type), {
            [styles.checkerboard]: type === "color" && isTransparent,
          })}
          style={getSwatchStyle(type, value)}
        />
      </ThemeProvider>
    </div>
  );
}

function isTransparentColor(normalizedColor: string) {
  const color = normalizedColor.trim().toLowerCase();

  return (
    color === "transparent" ||
    /^rgba\([^,]+,[^,]+,[^,]+,\s*0(?:\.0+)?\)$/.test(color) ||
    /^rgb\([^/]+\/\s*0(?:\.0+)?\)$/.test(color)
  );
}

function getSwatchClassName(
  type: Exclude<ReturnType<typeof getPreviewType>, "raw">,
) {
  switch (type) {
    case "color":
      return styles.swatchColor;
    case "shadow":
      return styles.swatchShadow;
    case "borderStyle":
      return styles.swatchBorderStyle;
    case "borderWidth":
      return styles.swatchBorderWidth;
    case "outline":
      return styles.swatchOutline;
  }
}
