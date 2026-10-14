import { useColorMode } from "@jpmorganchase/mosaic-store";
import {
  Code,
  type Density,
  Display1,
  Display2,
  Display3,
  Display4,
  Editorial1,
  Editorial2,
  Editorial3,
  Editorial4,
  Editorial5,
  Editorial6,
  Eyebrow,
  SaltProvider,
  SaltProviderNext,
  Text,
  TextAction,
  TextNotation,
  type TextProps,
} from "@salt-ds/core";
import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getDensityDisplayName,
  type PreviewMode,
  ThemeSettingsOverlay,
} from "../components/ThemeSettingsOverlay";
import {
  getThemeDisplayName,
  type ThemeType,
  themes,
} from "../css-display/TokenTable";
import styles from "./TextStylesPreview.module.css";

type SampleProps = { children: ReactNode };
type Metrics = { fontSize: string; lineHeight: string };

// Headings and labels render as spans, so the preview doesn't add headings to the page outline or orphaned labels.
function textSample(styleAs?: TextProps<"span">["styleAs"]) {
  return function TextSample(props: SampleProps) {
    return <Text as="span" styleAs={styleAs} {...props} />;
  };
}

const textStyles: Array<{ name: string; Sample: ComponentType<SampleProps> }> =
  [
    { name: "Editorial1", Sample: Editorial1 },
    { name: "Editorial2", Sample: Editorial2 },
    { name: "Editorial3", Sample: Editorial3 },
    { name: "Editorial4", Sample: Editorial4 },
    { name: "Editorial5", Sample: Editorial5 },
    { name: "Editorial6", Sample: Editorial6 },
    { name: "Display1", Sample: Display1 },
    { name: "Display2", Sample: Display2 },
    { name: "Display3", Sample: Display3 },
    { name: "Display4", Sample: Display4 },
    { name: "H1", Sample: textSample("h1") },
    { name: "H2", Sample: textSample("h2") },
    { name: "H3", Sample: textSample("h3") },
    { name: "H4", Sample: textSample("h4") },
    { name: "Eyebrow", Sample: Eyebrow },
    { name: "Body2", Sample: textSample("body2") },
    { name: "Body1", Sample: textSample() },
    { name: "Action", Sample: TextAction },
    { name: "Label2", Sample: textSample("label2") },
    { name: "Label1", Sample: textSample("label") },
    { name: "Notation", Sample: TextNotation },
    { name: "Code", Sample: Code },
  ];

const themeOptions = themes.map(({ displayName, value }) => ({
  value,
  label: displayName,
}));

const defaultTheme: ThemeType = "next";
const defaultDensity: Density = "medium";
const defaultMode: PreviewMode = "system";

export const TextStylesPreview = () => {
  const siteMode = useColorMode();
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mode, setMode] = useState<PreviewMode>(defaultMode);
  const [metrics, setMetrics] = useState<Record<string, Metrics>>({});
  const listRef = useRef<HTMLUListElement>(null);

  // Sizes are read from the rendered samples so they always match the selected theme and density.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the theme or density changes
  useEffect(() => {
    const samples =
      listRef.current?.querySelectorAll<HTMLElement>("[data-text-style]") ?? [];
    const nextMetrics: Record<string, Metrics> = {};

    for (const sample of samples) {
      const { fontSize, lineHeight } = window.getComputedStyle(sample);
      nextMetrics[sample.dataset.textStyle ?? ""] = { fontSize, lineHeight };
    }

    setMetrics(nextMetrics);
  }, [theme, density]);

  const previewMode = mode === "system" ? siteMode : mode;

  const preview = (
    <div className={styles.preview}>
      <ul className={styles.list} aria-label="Text styles" ref={listRef}>
        {textStyles.map(({ name, Sample }) => {
          const sampleMetrics = metrics[name];

          return (
            <li key={name} className={styles.item}>
              <div className={styles.sample}>
                <Sample data-text-style={name}>{name}</Sample>
              </div>
              {sampleMetrics ? (
                <Text
                  styleAs="label"
                  color="secondary"
                  className={styles.metrics}
                >
                  Font size {sampleMetrics.fontSize} · Line height{" "}
                  {sampleMetrics.lineHeight}
                </Text>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Text styleAs="label" color="secondary" aria-live="polite">
          {getThemeDisplayName(theme)}, {getDensityDisplayName(density)} density
        </Text>
        <ThemeSettingsOverlay<ThemeType>
          scope="textStyles"
          contextLabel="Text styles"
          density={density}
          onDensityChange={setDensity}
          mode={mode}
          onModeChange={setMode}
          theme={theme}
          themeOptions={themeOptions}
          onThemeChange={setTheme}
          onReset={() => {
            setTheme(defaultTheme);
            setDensity(defaultDensity);
            setMode(defaultMode);
          }}
        />
      </div>
      {/* An explicit theme is needed to prevent the site theme being inherited */}
      {theme === "next" ? (
        <SaltProviderNext
          applyClassesTo="scope"
          theme=""
          density={density}
          mode={previewMode}
          headingFont="Amplitude"
          actionFont="Amplitude"
        >
          {preview}
        </SaltProviderNext>
      ) : (
        <SaltProvider
          applyClassesTo="scope"
          theme={theme === "salt-interim" ? "salt-interim" : ""}
          density={density}
          mode={previewMode}
        >
          {preview}
        </SaltProvider>
      )}
    </div>
  );
};
