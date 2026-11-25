import { useColorMode } from "@jpmorganchase/mosaic-store";
import {
  Button,
  SaltProvider,
  SaltProviderNext,
  Spinner,
  Switch,
  Text,
  useId,
} from "@salt-ds/core";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { LocalizationProvider } from "@salt-ds/date-components";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ElementType,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { Pre } from "../mdx/pre";
import { fetchExampleSource } from "./fetchExampleSource";
import styles from "./LivePreview.module.css";
import { useLivePreviewControls } from "./LivePreviewProvider";
import { usePreviewDensity } from "./previewDensity";

type LivePreviewProps = {
  componentName: string;
  exampleName: string;
};

type LoaderProps = LivePreviewProps & { onRetry: () => void };

type LoadState<T> =
  | { status: "loading" }
  | { status: "loaded"; value: T }
  | { status: "failed" };

/** Callers remount this with a new key to retry or to load a different example. */
function useLoad<T>(load: () => Promise<T>, description: string) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  // biome-ignore lint/correctness/useExhaustiveDependencies: Runs once per mount; the key changes when the example does.
  useEffect(() => {
    let current = true;
    load().then(
      (value) => {
        if (current) setState({ status: "loaded", value });
      },
      (error) => {
        console.error(`Failed to load ${description}`, error);
        if (current) setState({ status: "failed" });
      },
    );
    return () => {
      current = false;
    };
  }, []);
  return state;
}

function LoadFailed({
  children,
  onRetry,
}: {
  children: ReactNode;
  onRetry: () => void;
}) {
  return (
    <div className={styles.status}>
      <Text>{children}</Text>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function ExampleContent({ componentName, exampleName, onRetry }: LoaderProps) {
  const state = useLoad<ElementType>(
    async () =>
      (await import("./fetchExample")).default(componentName, exampleName),
    `example ${componentName}/${exampleName}`,
  );
  if (state.status === "loading") {
    // Many examples load with the page, so announcing each would be noisy.
    return <Spinner aria-label="Loading example" disableAnnouncer />;
  }
  if (state.status === "failed") {
    return <LoadFailed onRetry={onRetry}>Example failed to load.</LoadFailed>;
  }
  const Example = state.value;
  return <Example />;
}

function ExampleCode({ componentName, exampleName, onRetry }: LoaderProps) {
  const state = useLoad(
    () => fetchExampleSource(componentName, exampleName),
    `code for ${componentName}/${exampleName}`,
  );
  if (state.status === "loading") {
    return (
      <div className={clsx(styles.status, styles.codeStatus)}>
        <Spinner aria-label="Loading code" />
      </div>
    );
  }
  if (state.status === "failed") {
    return (
      <div className={styles.codeStatus}>
        <LoadFailed onRetry={onRetry}>Code failed to load.</LoadFailed>
      </div>
    );
  }
  return <Pre className={styles.codePreview} html={state.value} />;
}

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
}) => {
  const siteMode = useColorMode();
  const [showCode, setShowCode] = useState<boolean>(false);
  const [hasShownCode, setHasShownCode] = useState(false);
  const [exampleAttempt, setExampleAttempt] = useState(0);
  const [codeAttempt, setCodeAttempt] = useState(0);
  const exampleKey = `${componentName}/${exampleName}`;

  // Start fetching the code when the reader is likely to ask for it.
  const prefetchCode = () => {
    fetchExampleSource(componentName, exampleName).catch(() => {});
  };

  const {
    density: previewDensity,
    mode: exampleMode,
    theme,
  } = useLivePreviewControls();
  const { density, themeClassName: densityThemeClassName } =
    usePreviewDensity(previewDensity);
  const mode = (exampleMode === "system" ? siteMode : exampleMode) ?? siteMode;
  const handleShowCodeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const newShowCode = event.target.checked;
    if (newShowCode) setHasShownCode(true);
    setShowCode(newShowCode);
  };

  const ChosenSaltProvider =
    theme === "brand" ? SaltProviderNext : SaltProvider;

  const panelId = useId();

  return (
    <div className={styles.container}>
      <div className={styles.componentPreview}>
        <LocalizationProvider DateAdapter={AdapterLuxon}>
          <div className={styles.exampleWithSwitch}>
            <ChosenSaltProvider
              mode={mode}
              accent="teal"
              corner="rounded"
              headingFont="Amplitude"
              actionFont="Amplitude"
              applyClassesTo="scope"
            >
              <div className={styles.example}>
                {/* An explicit theme is needed here to prevent the site theme being inherited */}
                <ChosenSaltProvider
                  applyClassesTo="scope"
                  theme={clsx(
                    theme === "salt-interim" && "salt-interim",
                    densityThemeClassName,
                  )}
                  density={density}
                  mode={mode}
                >
                  {/* The key resets the state for a retry or a different example. */}
                  <ExampleContent
                    key={`${exampleKey}#${exampleAttempt}`}
                    componentName={componentName}
                    exampleName={exampleName}
                    onRetry={() => setExampleAttempt((attempt) => attempt + 1)}
                  />
                </ChosenSaltProvider>
              </div>
            </ChosenSaltProvider>
            {/* Unset theme, font size override would cause switch misalignment */}
            <SaltProviderNext density="low" applyClassesTo="child" theme="">
              <div
                className={styles.toolbar}
                onPointerEnter={prefetchCode}
                onFocus={prefetchCode}
              >
                <Switch
                  checked={showCode}
                  onChange={handleShowCodeToggle}
                  className={styles.switch}
                  label="Show code"
                  aria-controls={panelId}
                />
              </div>
            </SaltProviderNext>
          </div>
        </LocalizationProvider>
      </div>
      <div
        className={styles.codePanel}
        aria-hidden={!showCode}
        hidden={!showCode}
        id={panelId}
      >
        {hasShownCode && (
          <div className={styles.codePanelInner}>
            <ExampleCode
              key={`${exampleKey}#${codeAttempt}`}
              componentName={componentName}
              exampleName={exampleName}
              onRetry={() => setCodeAttempt((attempt) => attempt + 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
