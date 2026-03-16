import { SaltProvider, SaltProviderNext } from "@salt-ds/core";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { Code } from "../mdx/code";
import styles from "./AllTokens.module.css";
import { getPreviewType, getSwatchStyle } from "./tokenPreviewUtils";

export function TokenPreview({
  name,
  value,
  mode,
  themeKey,
  theme,
}: {
  name: string;
  value: string;
  mode: "light" | "dark";
  themeKey: string;
  theme: "next" | "legacy";
}) {
  const type = getPreviewType(name, value);
  const [isTransparent, setIsTransparent] = useState(false);
  const swatchRef = useRef<HTMLDivElement | null>(null);
  const ThemeProvider = theme === "next" ? SaltProviderNext : SaltProvider;

  useEffect(() => {
    if (type !== "color") {
      setIsTransparent(false);
      return;
    }

    const node = swatchRef.current;
    if (!node) {
      return;
    }

    const normalized = window
      .getComputedStyle(node)
      .backgroundColor.replaceAll(" ", "")
      .toLowerCase();

    setIsTransparent(
      normalized === "transparent" ||
        normalized.includes("rgba(0,0,0,0)") ||
        normalized.endsWith(",0)"),
    );
  }, [themeKey, type, value]);

  if (type === "raw") {
    return <Code>{value}</Code>;
  }

  return (
    <div className={styles.swatch}>
      <ThemeProvider theme="" mode={mode} applyClassesTo="child">
        <div
          ref={swatchRef}
          className={clsx(styles.swatchInner, getSwatchClassName(type), {
            [styles.checkerboard]: type === "color" && isTransparent,
          })}
          style={getSwatchStyle(type, value)}
        />
      </ThemeProvider>
    </div>
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
