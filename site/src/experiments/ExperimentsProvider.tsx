import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type ExperimentId, experiments, isExperimentId } from "./experiments";

const STORAGE_KEY = "salt-docs-experiments";
export const EXPERIMENTS_QUERY_PARAM = "experiments";

export interface ExperimentsContextValue {
  enabled: readonly ExperimentId[];
  setExperimentEnabled: (id: ExperimentId, enabled: boolean) => void;
  disableAll: () => void;
}

const ExperimentsContext = createContext<ExperimentsContextValue>({
  enabled: [],
  setExperimentEnabled: () => {},
  disableAll: () => {},
});

// Keeps experiments in registry order, which is the order they're applied.
const inRegistryOrder = (ids: Iterable<string>): ExperimentId[] => {
  const selected = new Set(ids);
  return experiments
    .map((experiment) => experiment.id)
    .filter((id) => selected.has(id));
};

function readStoredExperiments(): ExperimentId[] {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(stored)
      ? inRegistryOrder(stored.filter(isExperimentId))
      : [];
  } catch {
    return [];
  }
}

function useExperimentStylesheets(enabled: readonly ExperimentId[]) {
  useEffect(() => {
    const active = experiments.filter((experiment) =>
      enabled.includes(experiment.id),
    );
    if (!active.length) return;

    let cancelled = false;
    const styleElements: HTMLStyleElement[] = [];

    Promise.all(active.map((experiment) => experiment.loadStylesheet()))
      .then((stylesheets) => {
        if (cancelled) return;
        stylesheets.forEach((css, index) => {
          const style = document.createElement("style");
          style.dataset.saltExperiment = active[index].id;
          style.textContent = css;
          // Appended after the theme stylesheets so the experiments override them
          document.head.append(style);
          styleElements.push(style);
        });
      })
      .catch((error: unknown) => {
        console.error("Couldn't load an experiment's stylesheet", error);
      });

    return () => {
      cancelled = true;
      for (const style of styleElements) style.remove();
    };
  }, [enabled]);
}

/**
 * Applies experimental stylesheets across the site. Experiments can be turned
 * on with `?experiments=rem-units,mobile-interim` in the URL, which is
 * remembered, or from the experiments page. `?experiments=` turns them off.
 */
export function ExperimentsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<ExperimentId[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(
      EXPERIMENTS_QUERY_PARAM,
    );
    setEnabled(
      fromUrl === null
        ? readStoredExperiments()
        : inRegistryOrder(fromUrl.split(",").map((id) => id.trim())),
    );
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    } catch {
      // Storage can be unavailable, for example in private browsing.
    }
  }, [enabled, initialized]);

  useExperimentStylesheets(enabled);

  // Lets the site's own CSS adapt to experiments, e.g. [data-salt-experiments~="rem-units"]
  useEffect(() => {
    const root = document.documentElement;
    if (enabled.length) {
      root.dataset.saltExperiments = enabled.join(" ");
    } else {
      delete root.dataset.saltExperiments;
    }
  }, [enabled]);

  const setExperimentEnabled = useCallback((id: ExperimentId, on: boolean) => {
    setEnabled((current) =>
      inRegistryOrder(
        on ? [...current, id] : current.filter((value) => value !== id),
      ),
    );
  }, []);

  const disableAll = useCallback(() => setEnabled([]), []);

  const value = useMemo(
    () => ({ enabled, setExperimentEnabled, disableAll }),
    [enabled, setExperimentEnabled, disableAll],
  );

  return (
    <ExperimentsContext.Provider value={value}>
      {children}
    </ExperimentsContext.Provider>
  );
}

export const useExperiments = () => useContext(ExperimentsContext);
