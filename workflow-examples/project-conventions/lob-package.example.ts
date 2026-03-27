export const markets = {
  contract: "project_conventions_v1",
  version: "1.0.0",
  project: "lob-markets",
  preferred_components: [
    {
      salt_name: "Button",
      prefer: "MarketsButton",
      reason:
        "Markets product actions use one shared wrapper for analytics and execution defaults.",
      docs: ["./docs/markets-button.md"],
    },
  ],
  banned_choices: [
    {
      name: "UNSTABLE_SaltProviderNext",
      replacement: "SaltProvider",
      reason: "The line of business is standardized on SaltProvider only.",
      docs: ["./docs/platform-conventions.md"],
    },
  ],
  notes: [
    "Example package export for a line-of-business layer consumed through .salt/stack.json.",
  ],
} as const;
