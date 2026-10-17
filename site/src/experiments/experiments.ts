export interface Experiment {
  id: string;
  name: string;
  description: string;
  loadStylesheet: () => Promise<string>;
}

// Listed in the order their stylesheets are applied, so later experiments take
// precedence, matching the import order each stylesheet documents.
export const experiments = [
  {
    id: "rem-units",
    name: "Rem units",
    description:
      "Sizes text, components and spacing in rem, so they scale with your browser's font size setting as well as with page zoom.",
    loadStylesheet: () =>
      import("@salt-ds/theme/css/experimental/rem-units.css?raw").then(
        (module) => module.default,
      ),
  },
  {
    id: "mobile-interim",
    name: "Mobile density (Interim)",
    description:
      "Gives the mobile density more compact spacing, text and sizes. It applies to examples set to mobile density and to this site on small screens.",
    loadStylesheet: () =>
      import("@salt-ds/theme/css/experimental/mobile-interim.css?raw").then(
        (module) => module.default,
      ),
  },
] as const satisfies readonly Experiment[];

export type RegisteredExperiment = (typeof experiments)[number];
export type ExperimentId = RegisteredExperiment["id"];

export const isExperimentId = (value: string): value is ExperimentId =>
  experiments.some((experiment) => experiment.id === value);
