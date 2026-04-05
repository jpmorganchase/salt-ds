import {
  compareOptions,
  compareVersions,
  createSaltUi,
  discoverSalt,
  getChanges,
  getComponent,
  getCompositionRecipe,
  getCountrySymbol,
  getCountrySymbols,
  getExamples,
  getFoundation,
  getGuide,
  getIcon,
  getIcons,
  getPackage,
  getPage,
  getPattern,
  getRelatedEntities,
  getSaltEntity,
  getSaltExamples,
  getToken,
  listFoundations,
  listSaltCatalog,
  migrateToSalt,
  recommendComponent,
  recommendTokens,
  searchApiSurface,
  searchComponentCapabilities,
  searchSaltDocs,
  upgradeSaltUi,
} from "@salt-ds/semantic-core";
import { mergeCanonicalAndProjectConventionLayers } from "@salt-ds/semantic-core/policy";
import {
  buildPatternRecipe,
  toRecipeStarterCode,
} from "@salt-ds/semantic-core/tools/getCompositionRecipeHelpers";
import { isComponentAllowedByDocsPolicy } from "@salt-ds/semantic-core/tools/utils";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { describe, expect, it } from "vitest";

const TIMESTAMP = "2026-03-10T00:00:00Z";

const REGISTRY: SaltRegistry = {
  generated_at: TIMESTAMP,
  version: "1.0.0",
  build_info: null,
  packages: [
    {
      id: "package.core",
      name: "@salt-ds/core",
      status: "stable",
      version: "2.0.0",
      summary: "Core Salt components.",
      source_root: "packages/core",
      changelog_path: "packages/core/CHANGELOG.md",
      docs_root: "/salt/components",
    },
    {
      id: "package.lab",
      name: "@salt-ds/lab",
      status: "lab",
      version: "2.0.0",
      summary: "Lab Salt components.",
      source_root: "packages/lab",
      changelog_path: "packages/lab/CHANGELOG.md",
      docs_root: "/salt/components",
    },
    {
      id: "package.icons",
      name: "@salt-ds/icons",
      status: "stable",
      version: "1.17.1",
      summary: "Salt icons.",
      source_root: "packages/icons",
      changelog_path: "packages/icons/CHANGELOG.md",
      docs_root: "/salt/components",
    },
    {
      id: "package.countries",
      name: "@salt-ds/countries",
      status: "stable",
      version: "1.5.1",
      summary: "Salt country symbols.",
      source_root: "packages/countries",
      changelog_path: "packages/countries/CHANGELOG.md",
      docs_root: "/salt/components",
    },
  ],
  components: [
    {
      id: "component.button",
      name: "Button",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Executes an action.",
      status: "stable",
      category: ["actions"],
      tags: ["action", "form"],
      when_to_use: ["Trigger an immediate action."],
      when_not_to_use: ["Use Link for navigation."],
      alternatives: [{ use: "Link", reason: "Use for navigation." }],
      props: [
        {
          name: "appearance",
          type: "string",
          required: false,
          description: "Visual treatment.",
          default: null,
          allowed_values: ["solid", "bordered", "transparent"],
          deprecated: false,
        },
        {
          name: "variant",
          type: '"primary" | "secondary" | "cta"',
          required: false,
          description: "Deprecated variant prop.",
          default: "primary",
          deprecated: true,
          deprecation_note:
            "Use appearance and sentiment instead. | variant | appearance | sentiment | | ----------- | ------------- | ----------- | | cta | solid | accented | | primary | solid | neutral | | secondary | transparent | neutral |",
        },
      ],
      accessibility: {
        summary: ["Must have an accessible name."],
        rules: [
          {
            id: "button-name",
            severity: "error",
            rule: "Provide visible text or another accessible name.",
          },
        ],
      },
      tokens: [
        {
          name: "--salt-size-base",
          category: "size",
          semantic_intent: "base control size",
        },
      ],
      patterns: ["split-button"],
      examples: [
        {
          id: "button.primary.submit",
          title: "Primary form submit",
          intent: ["submit form"],
          complexity: "basic",
          code: '<Button appearance="solid">Save</Button>',
          source_url: "/salt/components/button/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Button",
        },
      ],
      related_docs: {
        overview: "/salt/components/button",
        usage: "/salt/components/button/usage",
        accessibility: "/salt/components/button/accessibility",
        examples: "/salt/components/button/examples",
      },
      source: {
        repo_path: "packages/core/src/button",
        export_name: "Button",
      },
      deprecations: ["dep.button.variant"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.link",
      name: "Link",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Navigates to another route or location.",
      status: "stable",
      category: ["navigation"],
      tags: ["navigation"],
      when_to_use: ["Navigate to another route."],
      when_not_to_use: [],
      alternatives: [{ use: "Button", reason: "Use for action execution." }],
      props: [],
      accessibility: {
        summary: ["Links should have clear text labels."],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/link",
        usage: "/salt/components/link/usage",
        accessibility: "/salt/components/link/accessibility",
        examples: "/salt/components/link/examples",
      },
      source: {
        repo_path: "packages/core/src/link",
        export_name: "Link",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.vertical-navigation",
      name: "VerticalNavigation",
      aliases: ["vertical navigation", "sidebar navigation"],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary:
        "Structured vertical navigation for sidebars, shells, and nested navigation groups.",
      status: "stable",
      category: ["navigation"],
      tags: ["navigation", "sidebar", "app shell"],
      when_to_use: [
        "Use for app-level vertical navigation or structured sidebar navigation.",
      ],
      when_not_to_use: ["Use Link for a single destination."],
      alternatives: [
        { use: "Link", reason: "Use for a single navigation target." },
      ],
      props: [],
      accessibility: {
        summary: ["Provide a clear accessible name for the navigation region."],
        rules: [],
      },
      tokens: [],
      patterns: ["Vertical navigation"],
      examples: [
        {
          id: "vertical-navigation.basic",
          title: "Basic vertical navigation",
          intent: ["sidebar navigation"],
          complexity: "intermediate",
          code: '<VerticalNavigation aria-label="Main navigation" />',
          source_url: "/salt/components/vertical-navigation/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "VerticalNavigation",
        },
      ],
      related_docs: {
        overview: "/salt/components/vertical-navigation",
        usage: "/salt/components/vertical-navigation/usage",
        accessibility: "/salt/components/vertical-navigation/accessibility",
        examples: "/salt/components/vertical-navigation/examples",
      },
      source: {
        repo_path: "packages/core/src/vertical-navigation",
        export_name: "VerticalNavigation",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.unstable-salt-provider-next",
      name: "UNSTABLE_SaltProviderNext",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "deprecated",
        since: "1.0.0",
      },
      summary: "Legacy provider implementation.",
      status: "deprecated",
      category: ["providers"],
      tags: ["provider"],
      when_to_use: [],
      when_not_to_use: ["Use SaltProvider instead."],
      alternatives: [
        { use: "SaltProvider", reason: "Use the supported provider." },
      ],
      props: [],
      accessibility: {
        summary: [],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/salt-provider-next",
        usage: "/salt/components/salt-provider-next/usage",
        accessibility: "/salt/components/salt-provider-next/accessibility",
        examples: "/salt/components/salt-provider-next/examples",
      },
      source: {
        repo_path: "packages/core/src/salt-provider-next",
        export_name: "UNSTABLE_SaltProviderNext",
      },
      deprecations: ["dep.provider.unstable"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.datepicker",
      name: "DatePicker",
      aliases: [],
      package: {
        name: "@salt-ds/lab",
        status: "lab",
        since: "1.0.0",
      },
      summary: "Experimental date picker.",
      status: "lab",
      category: ["inputs"],
      tags: ["date"],
      when_to_use: ["Use when evaluating lab date entry patterns."],
      when_not_to_use: [
        "Avoid in production unless the lab dependency is intentional.",
      ],
      alternatives: [],
      props: [],
      accessibility: {
        summary: [],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/date-picker",
        usage: "/salt/components/date-picker/usage",
        accessibility: "/salt/components/date-picker/accessibility",
        examples: "/salt/components/date-picker/examples",
      },
      source: {
        repo_path: "packages/lab/src/date-picker",
        export_name: "DatePicker",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.experimental-widget",
      name: "ExperimentalWidget",
      aliases: [],
      package: {
        name: "@salt-ds/lab",
        status: "lab",
        since: "1.0.0",
      },
      summary: "Undocumented internal-only experimental widget.",
      status: "lab",
      category: ["internal"],
      tags: ["experimental"],
      when_to_use: ["Internal evaluation only."],
      when_not_to_use: ["Do not recommend for product usage."],
      alternatives: [],
      props: [],
      accessibility: {
        summary: [],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: null,
        usage: null,
        accessibility: null,
        examples: null,
      },
      source: {
        repo_path: "packages/lab/src/experimental-widget",
        export_name: "ExperimentalWidget",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
  ],
  icons: [
    {
      id: "icon.workflow-icon",
      name: "WorkflowIcon",
      base_name: "Workflow",
      figma_name: "workflow",
      package: {
        name: "@salt-ds/icons",
        status: "stable",
        since: null,
      },
      summary:
        "Workflow icon for organize concepts such as nodes, process, sequence.",
      status: "stable",
      category: "organize",
      synonyms: ["nodes", "process", "sequence"],
      aliases: [
        "WorkflowIcon",
        "Workflow",
        "workflow",
        "workflow icon",
        "nodes",
        "process",
        "sequence",
      ],
      variant: "outline",
      related_docs: {
        overview: "/salt/components/icon",
        examples: "/salt/components/icon/examples",
        foundation: "/salt/foundations/assets/index",
      },
      source: {
        repo_path: "packages/icons/src/components/Workflow.tsx",
        export_name: "WorkflowIcon",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "icon.workflow-solid-icon",
      name: "WorkflowSolidIcon",
      base_name: "WorkflowSolid",
      figma_name: "workflow",
      package: {
        name: "@salt-ds/icons",
        status: "stable",
        since: null,
      },
      summary:
        "Workflow solid icon for organize concepts such as nodes, process, sequence.",
      status: "stable",
      category: "organize",
      synonyms: ["nodes", "process", "sequence"],
      aliases: [
        "WorkflowSolidIcon",
        "WorkflowSolid",
        "workflow",
        "workflow solid",
        "workflow-solid",
        "Workflow",
        "workflow solid icon",
        "nodes",
        "process",
        "sequence",
        "solid nodes",
        "solid process",
        "solid sequence",
      ],
      variant: "solid",
      related_docs: {
        overview: "/salt/components/icon",
        examples: "/salt/components/icon/examples",
        foundation: "/salt/foundations/assets/index",
      },
      source: {
        repo_path: "packages/icons/src/components/WorkflowSolid.tsx",
        export_name: "WorkflowSolidIcon",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "icon.sparkle-refresh-icon",
      name: "SparkleRefreshIcon",
      base_name: "SparkleRefresh",
      figma_name: "sparkle-refresh",
      package: {
        name: "@salt-ds/icons",
        status: "stable",
        since: null,
      },
      summary:
        "Sparkle Refresh icon for computing concepts such as renew, ai, llm.",
      status: "stable",
      category: "computing",
      synonyms: ["renew", "ai", "llm", "artificial intelligence"],
      aliases: [
        "SparkleRefreshIcon",
        "SparkleRefresh",
        "sparkle-refresh",
        "sparkle refresh",
        "sparkle refresh icon",
        "renew",
        "ai",
        "llm",
        "artificial intelligence",
      ],
      variant: "outline",
      related_docs: {
        overview: "/salt/components/icon",
        examples: "/salt/components/icon/examples",
        foundation: "/salt/foundations/assets/index",
      },
      source: {
        repo_path: "packages/icons/src/components/SparkleRefresh.tsx",
        export_name: "SparkleRefreshIcon",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
  ],
  country_symbols: [
    {
      id: "country_symbol.us",
      code: "US",
      name: "United States of America (the)",
      package: {
        name: "@salt-ds/countries",
        status: "stable",
        since: null,
      },
      summary:
        "Asset for United States of America (the); available in circle and sharp variants.",
      status: "stable",
      aliases: [
        "US",
        "US_Sharp",
        "United States of America (the)",
        "United States of America",
        "The United States of America",
        "United States",
      ],
      variants: {
        circle: {
          export_name: "US",
          repo_path: "packages/countries/src/components/US.tsx",
        },
        sharp: {
          export_name: "US_Sharp",
          repo_path: "packages/countries/src/components/US_Sharp.tsx",
        },
      },
      related_docs: {
        overview: "/salt/components/country-symbol",
        usage: "/salt/components/country-symbol/usage",
        accessibility: "/salt/components/country-symbol/accessibility",
        examples: "/salt/components/country-symbol/examples",
        foundation: "/salt/foundations/assets/country-symbols",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "country_symbol.gb-eng",
      code: "GB-ENG",
      name: "England",
      package: {
        name: "@salt-ds/countries",
        status: "stable",
        since: null,
      },
      summary: "Asset for England; available in circle and sharp variants.",
      status: "stable",
      aliases: ["GB-ENG", "GB_ENG", "GB ENG", "GB_ENG_Sharp", "England"],
      variants: {
        circle: {
          export_name: "GB_ENG",
          repo_path: "packages/countries/src/components/GB_ENG.tsx",
        },
        sharp: {
          export_name: "GB_ENG_Sharp",
          repo_path: "packages/countries/src/components/GB_ENG_Sharp.tsx",
        },
      },
      related_docs: {
        overview: "/salt/components/country-symbol",
        usage: "/salt/components/country-symbol/usage",
        accessibility: "/salt/components/country-symbol/accessibility",
        examples: "/salt/components/country-symbol/examples",
        foundation: "/salt/foundations/assets/country-symbols",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "country_symbol.cd",
      code: "CD",
      name: "Congo (the Democratic Republic of the)",
      package: {
        name: "@salt-ds/countries",
        status: "stable",
        since: null,
      },
      summary:
        "Asset for Congo (the Democratic Republic of the); available in circle and sharp variants.",
      status: "stable",
      aliases: [
        "CD",
        "CD_Sharp",
        "Congo (the Democratic Republic of the)",
        "Congo",
        "Democratic Republic of Congo",
      ],
      variants: {
        circle: {
          export_name: "CD",
          repo_path: "packages/countries/src/components/CD.tsx",
        },
        sharp: {
          export_name: "CD_Sharp",
          repo_path: "packages/countries/src/components/CD_Sharp.tsx",
        },
      },
      related_docs: {
        overview: "/salt/components/country-symbol",
        usage: "/salt/components/country-symbol/usage",
        accessibility: "/salt/components/country-symbol/accessibility",
        examples: "/salt/components/country-symbol/examples",
        foundation: "/salt/foundations/assets/country-symbols",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "country_symbol.cg",
      code: "CG",
      name: "Congo (the)",
      package: {
        name: "@salt-ds/countries",
        status: "stable",
        since: null,
      },
      summary: "Asset for Congo (the); available in circle and sharp variants.",
      status: "stable",
      aliases: ["CG", "CG_Sharp", "Congo (the)", "Congo", "The Congo"],
      variants: {
        circle: {
          export_name: "CG",
          repo_path: "packages/countries/src/components/CG.tsx",
        },
        sharp: {
          export_name: "CG_Sharp",
          repo_path: "packages/countries/src/components/CG_Sharp.tsx",
        },
      },
      related_docs: {
        overview: "/salt/components/country-symbol",
        usage: "/salt/components/country-symbol/usage",
        accessibility: "/salt/components/country-symbol/accessibility",
        examples: "/salt/components/country-symbol/examples",
        foundation: "/salt/foundations/assets/country-symbols",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
  ],
  pages: [
    {
      id: "page.salt-index",
      title: "Salt Design System",
      route: "/salt/index",
      page_kind: "landing",
      summary:
        "Salt is J.P. Morgan's open-source design system with accessible components and design resources.",
      keywords: ["homepage", "accessibility", "wcag"],
      content: [
        "Salt provides accessible components and extensive design resources to create exceptional digital experiences.",
        "Our components follow Web Content Accessibility Guidelines (WCAG) 2.1 to AA standards as a core requirement, not an afterthought.",
      ],
      section_headings: ["WCAG 2.1 accessibility"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "page.salt-about-glossary",
      title: "Glossary",
      route: "/salt/about/glossary",
      page_kind: "about",
      summary:
        "Learn what technical terms for design and development mean in the context of Salt.",
      keywords: ["glossary", "wcag standards"],
      content: [
        "We follow Web Content Accessibility Guidelines (WCAG) 2.1, and we strive to meet Level A and AA standards.",
      ],
      section_headings: ["WCAG standards"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "page.salt-foundations-typography",
      title: "Typography",
      route: "/salt/foundations/typography",
      page_kind: "foundation",
      summary:
        "Typography foundations define the text hierarchy, emphasis, and readable scale used across Salt experiences.",
      keywords: ["typography", "foundations", "type scale", "text"],
      content: [
        "Use typography foundations to create clear hierarchy across labels, headings, and body content.",
        "Choose text styles from the Salt scale instead of introducing custom font sizing in components.",
      ],
      section_headings: ["Type scale", "Hierarchy", "Best practices"],
      last_verified_at: TIMESTAMP,
    },
  ],
  patterns: [
    {
      id: "pattern.split-button",
      name: "Split button",
      aliases: ["/salt/patterns/split-button", "split action"],
      summary: "A primary action with fallback options in a related menu.",
      status: "stable",
      category: ["actions-and-commands"],
      when_to_use: [
        "One action is most likely, with secondary actions still available.",
      ],
      when_not_to_use: ["Do not use when all options are equal in importance."],
      composed_of: [
        { component: "Button", role: "primary action" },
        { component: "Menu", role: "secondary actions" },
      ],
      related_patterns: ["Button bar"],
      how_to_build: [
        "Use a primary button for the dominant action.",
        "Pair it with a menu trigger for secondary actions.",
      ],
      how_it_works: [
        "The primary trigger executes immediately.",
        "The menu trigger exposes related fallback actions.",
      ],
      accessibility: {
        summary: ["Ensure keyboard access to both triggers and menu items."],
      },
      resources: [
        {
          label: "Examples",
          href: "https://storybook.saltdesignsystem.com/?path=/story/patterns-split-button--default",
          internal: false,
        },
      ],
      examples: [
        {
          id: "split-button.basic",
          title: "Basic split button",
          intent: ["primary action with alternatives"],
          complexity: "intermediate",
          code: "// split button example",
          source_url: "/salt/patterns/split-button/examples",
          package: "@salt-ds/core",
          target_type: "pattern",
          target_name: "Split button",
        },
      ],
      related_docs: {
        overview: "/salt/patterns/split-button",
      },
      last_verified_at: TIMESTAMP,
    },
  ],
  guides: [
    {
      id: "guide.developing-with-salt",
      name: "Developing with Salt",
      aliases: ["getting started", "setup", "bootstrap"],
      kind: "getting-started",
      summary:
        "Learn how to use Salt's UI components in your React web applications.",
      packages: ["@salt-ds/core", "@salt-ds/theme", "@salt-ds/icons"],
      steps: [
        {
          title: "Install core packages",
          statements: [
            "@salt-ds/core contains production-ready UI components.",
            "@salt-ds/theme contains the default Salt theme CSS.",
          ],
          snippets: [
            {
              title: "Install Salt packages",
              language: "shell",
              code: "npm install @salt-ds/core @salt-ds/theme @salt-ds/icons",
            },
          ],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/developing",
        related_components: ["SaltProvider", "Button"],
        related_packages: ["@salt-ds/core", "@salt-ds/theme", "@salt-ds/icons"],
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "guide.choosing-the-right-primitive",
      name: "Choosing the right primitive",
      aliases: [
        "primitive choice",
        "button vs link",
        "choose component",
        "choosing primitives",
      ],
      kind: "getting-started",
      summary:
        "Choose Salt components, layouts, and patterns by user intent first, then prefer the most constrained Salt option before creating custom UI.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "Start with user intent",
          statements: [
            "Use Button for actions in the current view.",
            "Use Link for navigation to another route or destination.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/choosing-the-right-primitive",
        related_components: ["Button", "Link", "Accordion", "Collapsible"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "guide.composition-pitfalls",
      name: "Composition pitfalls",
      aliases: [
        "composition",
        "composition review",
        "wrappers",
        "nested interactive",
        "pass-through wrapper",
      ],
      kind: "getting-started",
      summary:
        "Review the most common Salt composition mistakes, including nested interactive primitives, pass-through wrappers, and rebuilding standard primitives.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "Pitfalls to avoid",
          statements: [
            "Do not nest interactive Salt primitives.",
            "Treat pass-through wrappers as suspicious.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/composition-pitfalls",
        related_components: ["Button", "Link"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "guide.custom-wrappers",
      name: "Custom wrappers",
      aliases: [
        "wrapper component",
        "custom wrappers",
        "wrapper review",
        "prop forwarding",
      ],
      kind: "getting-started",
      summary:
        "Learn when a wrapper over a Salt primitive adds value and when it is only hiding the underlying component behind prop forwarding.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "When wrappers hurt",
          statements: [
            "Avoid wrappers that only forward props to a single Salt primitive.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/custom-wrappers",
        related_components: ["Button", "Link"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
  ],
  tokens: [
    {
      name: "--salt-size-base",
      category: "size",
      type: "dimension",
      value: "32px",
      semantic_intent: "base control size",
      themes: ["salt", "next"],
      densities: ["high", "medium", "low", "touch"],
      applies_to: ["Button", "Input"],
      guidance: ["Use semantic sizing tokens for control sizing."],
      aliases: [],
      deprecated: false,
      last_verified_at: TIMESTAMP,
    },
    {
      name: "--salt-color-warning-foreground",
      category: "color",
      type: "color",
      value: "#b45309",
      semantic_intent: "warning",
      themes: ["salt", "next"],
      densities: ["high", "medium", "low", "touch"],
      applies_to: ["Badge", "Text"],
      guidance: ["Use semantic warning foreground token."],
      aliases: [],
      deprecated: false,
      last_verified_at: TIMESTAMP,
    },
  ],
  deprecations: [
    {
      id: "dep.button.variant",
      package: "@salt-ds/core",
      component: "Button",
      kind: "prop",
      name: "variant",
      deprecated_in: "2.0.0",
      removed_in: null,
      replacement: {
        type: "prop",
        name: "appearance",
        notes: "Use appearance and sentiment instead.",
      },
      migration: {
        strategy: "replace",
        details: [{ from: 'variant="cta"', to: 'appearance="solid"' }],
      },
      source_urls: ["/salt/changelog"],
    },
    {
      id: "dep.provider.unstable",
      package: "@salt-ds/core",
      component: null,
      kind: "component",
      name: "UNSTABLE_SaltProviderNext",
      deprecated_in: "2.0.0",
      removed_in: null,
      replacement: {
        type: "component",
        name: "SaltProvider",
        notes: "Use SaltProvider instead.",
      },
      migration: {
        strategy: "replace",
        details: [
          {
            from: "<UNSTABLE_SaltProviderNext>",
            to: "<SaltProvider>",
          },
        ],
      },
      source_urls: ["/salt/changelog"],
    },
  ],
  examples: [
    {
      id: "button.primary.submit",
      title: "Primary form submit",
      intent: ["submit form"],
      complexity: "basic",
      code: '<Button appearance="solid">Save</Button>',
      source_url: "/salt/components/button/examples",
      package: "@salt-ds/core",
      target_type: "component",
      target_name: "Button",
    },
    {
      id: "datepicker.default",
      title: "Default date picker",
      intent: ["pick a date"],
      complexity: "basic",
      code: "<DatePicker />",
      source_url: "/salt/components/date-picker/examples",
      package: "@salt-ds/lab",
      target_type: "component",
      target_name: "DatePicker",
    },
    {
      id: "experimental-widget.default",
      title: "Experimental widget",
      intent: ["experimental"],
      complexity: "basic",
      code: "<ExperimentalWidget />",
      source_url: null,
      package: "@salt-ds/lab",
      target_type: "component",
      target_name: "ExperimentalWidget",
    },
  ],
  changes: [
    {
      id: "chg.core.button.2-0-0",
      package: "@salt-ds/core",
      target_type: "component",
      target_name: "Button",
      version: "2.0.0",
      release_type: "minor",
      kind: "deprecated",
      summary:
        "Deprecated Button variant prop in favor of appearance and sentiment.",
      details:
        "Deprecated Button variant prop in favor of appearance and sentiment.",
      source_urls: ["packages/core/CHANGELOG.md"],
      inference: {
        matched_by: "component_name",
        confidence: "high",
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "chg.core.button.2-0-1",
      package: "@salt-ds/core",
      target_type: "component",
      target_name: "Button",
      version: "2.0.1",
      release_type: "patch",
      kind: "fixed",
      summary: "Fixed Button keyboard active styling.",
      details: "Fixed Button keyboard active styling.",
      source_urls: ["packages/core/CHANGELOG.md"],
      inference: {
        matched_by: "component_name",
        confidence: "high",
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "chg.core.package.2-0-1",
      package: "@salt-ds/core",
      target_type: "package",
      target_name: "@salt-ds/core",
      version: "2.0.1",
      release_type: "patch",
      kind: "changed",
      summary: "Updated package-level release notes.",
      details: "Updated package-level release notes.",
      source_urls: ["packages/core/CHANGELOG.md"],
      inference: {
        matched_by: "package_default",
        confidence: "low",
      },
      last_verified_at: TIMESTAMP,
    },
  ],
  search_index: [
    {
      id: "chg.core.button.2-0-1",
      type: "change",
      name: "Button 2.0.1",
      package: "@salt-ds/core",
      status: "stable",
      summary: "Fixed Button keyboard active styling.",
      source_url: "packages/core/CHANGELOG.md",
      keywords: ["Button", "2.0.1", "fixed", "keyboard", "active styling"],
    },
    {
      id: "component.button",
      type: "component",
      name: "Button",
      package: "@salt-ds/core",
      status: "stable",
      summary: "Executes an action.",
      source_url: "/salt/components/button",
      keywords: ["action", "submit", "click"],
    },
    {
      id: "page.salt-index",
      type: "page",
      name: "Salt Design System",
      package: null,
      status: "stable",
      summary:
        "Salt is J.P. Morgan's open-source design system with accessible components and design resources.",
      source_url: "/salt/index",
      keywords: [
        "Salt Design System",
        "landing",
        "homepage",
        "accessibility",
        "wcag",
        "WCAG 2.1 accessibility",
      ],
    },
    {
      id: "page.salt-about-glossary",
      type: "page",
      name: "Glossary",
      package: null,
      status: "stable",
      summary:
        "Learn what technical terms for design and development mean in the context of Salt.",
      source_url: "/salt/about/glossary",
      keywords: ["Glossary", "about", "glossary", "wcag standards"],
    },
    {
      id: "page.salt-foundations-typography",
      type: "page",
      name: "Typography",
      package: null,
      status: "stable",
      summary:
        "Typography foundations define the text hierarchy, emphasis, and readable scale used across Salt experiences.",
      source_url: "/salt/foundations/typography",
      keywords: [
        "Typography",
        "foundation",
        "typography",
        "type scale",
        "text",
        "Hierarchy",
        "Best practices",
      ],
    },
    {
      id: "pattern.split-button",
      type: "pattern",
      name: "Split button",
      package: "@salt-ds/core",
      status: "stable",
      summary: "A primary action with fallback options in a related menu.",
      source_url: "/salt/patterns/split-button",
      keywords: ["split", "primary", "secondary", "fallback"],
    },
    {
      id: "guide.developing-with-salt",
      type: "guide",
      name: "Developing with Salt",
      package: null,
      status: "stable",
      summary:
        "Learn how to use Salt's UI components in your React web applications.",
      source_url: "/salt/getting-started/developing",
      keywords: [
        "getting started",
        "setup",
        "bootstrap",
        "@salt-ds/core",
        "@salt-ds/theme",
        "@salt-ds/icons",
      ],
    },
    {
      id: "icon.workflow-icon",
      type: "icon",
      name: "WorkflowIcon",
      package: "@salt-ds/icons",
      status: "stable",
      summary:
        "Workflow icon for organize concepts such as nodes, process, sequence.",
      source_url: "/salt/components/icon",
      keywords: [
        "WorkflowIcon",
        "Workflow",
        "workflow",
        "organize",
        "outline",
        "nodes",
        "process",
        "sequence",
      ],
    },
    {
      id: "icon.workflow-solid-icon",
      type: "icon",
      name: "WorkflowSolidIcon",
      package: "@salt-ds/icons",
      status: "stable",
      summary:
        "Workflow solid icon for organize concepts such as nodes, process, sequence.",
      source_url: "/salt/components/icon",
      keywords: [
        "WorkflowSolidIcon",
        "WorkflowSolid",
        "workflow solid",
        "workflow-solid",
        "organize",
        "solid",
        "nodes",
        "process",
        "sequence",
      ],
    },
    {
      id: "icon.sparkle-refresh-icon",
      type: "icon",
      name: "SparkleRefreshIcon",
      package: "@salt-ds/icons",
      status: "stable",
      summary:
        "Sparkle Refresh icon for computing concepts such as renew, ai, llm.",
      source_url: "/salt/components/icon",
      keywords: [
        "SparkleRefreshIcon",
        "SparkleRefresh",
        "sparkle-refresh",
        "computing",
        "renew",
        "ai",
        "llm",
        "artificial intelligence",
      ],
    },
    {
      id: "country_symbol.us",
      type: "country_symbol",
      name: "United States of America (the)",
      package: "@salt-ds/countries",
      status: "stable",
      summary:
        "Asset for United States of America (the); available in circle and sharp variants.",
      source_url: "/salt/foundations/assets/country-symbols",
      keywords: [
        "US",
        "United States of America (the)",
        "United States of America",
        "The United States of America",
        "United States",
        "US_Sharp",
      ],
    },
    {
      id: "country_symbol.gb-eng",
      type: "country_symbol",
      name: "England",
      package: "@salt-ds/countries",
      status: "stable",
      summary: "Asset for England; available in circle and sharp variants.",
      source_url: "/salt/foundations/assets/country-symbols",
      keywords: ["GB-ENG", "GB_ENG", "GB ENG", "GB_ENG_Sharp", "England"],
    },
    {
      id: "country_symbol.cd",
      type: "country_symbol",
      name: "Congo (the Democratic Republic of the)",
      package: "@salt-ds/countries",
      status: "stable",
      summary:
        "Asset for Congo (the Democratic Republic of the); available in circle and sharp variants.",
      source_url: "/salt/foundations/assets/country-symbols",
      keywords: [
        "CD",
        "CD_Sharp",
        "Congo (the Democratic Republic of the)",
        "Congo",
        "Democratic Republic of Congo",
      ],
    },
    {
      id: "country_symbol.cg",
      type: "country_symbol",
      name: "Congo (the)",
      package: "@salt-ds/countries",
      status: "stable",
      summary: "Asset for Congo (the); available in circle and sharp variants.",
      source_url: "/salt/foundations/assets/country-symbols",
      keywords: ["CG", "CG_Sharp", "Congo (the)", "Congo", "The Congo"],
    },
    {
      id: "component.datepicker",
      type: "component",
      name: "DatePicker",
      package: "@salt-ds/lab",
      status: "lab",
      summary: "Experimental date picker.",
      source_url: "/salt/components/date-picker",
      keywords: ["date", "picker", "calendar"],
    },
    {
      id: "component.experimental-widget",
      type: "component",
      name: "ExperimentalWidget",
      package: "@salt-ds/lab",
      status: "lab",
      summary: "Undocumented internal-only experimental widget.",
      source_url: null,
      keywords: ["experimental", "widget"],
    },
    {
      id: "example.datepicker.default",
      type: "example",
      name: "Default date picker",
      package: "@salt-ds/lab",
      status: null,
      summary: "Example for component DatePicker",
      source_url: "/salt/components/date-picker/examples",
      keywords: ["date", "picker", "example"],
    },
    {
      id: "example.experimental-widget.default",
      type: "example",
      name: "Experimental widget",
      package: "@salt-ds/lab",
      status: null,
      summary: "Example for component ExperimentalWidget",
      source_url: null,
      keywords: ["experimental", "widget", "example"],
    },
    {
      id: "token.size.base",
      type: "token",
      name: "--salt-size-base",
      package: null,
      status: null,
      summary: "Base control size token.",
      source_url: "/salt/foundations/tokens",
      keywords: ["size", "control", "base"],
    },
  ],
};

describe("searchSaltDocs", () => {
  it("returns split button for split-action intent", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "split action with fallback options",
      area: "patterns",
      top_k: 3,
    });

    expect(result.results[0]?.name).toBe("Split button");
  });

  it("returns score metadata so ranking reasons are visible", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "workflow",
      area: "icons",
      top_k: 1,
    });

    expect(result.results[0]).toMatchObject({
      name: "WorkflowIcon",
      match_reasons: expect.arrayContaining([
        "name_phrase",
        "name_tokens",
        "keyword_tokens",
      ]),
      matched_keywords: expect.arrayContaining(["workflow"]),
    });
    expect(result.results[0]?.score_breakdown.name_phrase).toBeGreaterThan(0);
    expect(result.results[0]?.score_breakdown.name_tokens).toBeGreaterThan(0);
  });

  it("filters undocumented lab components and examples from search results", () => {
    const experimentalResult = searchSaltDocs(REGISTRY, {
      query: "experimental widget",
      area: "all",
      top_k: 10,
    });
    const datePickerResult = searchSaltDocs(REGISTRY, {
      query: "date picker",
      area: "components",
      top_k: 10,
    });

    expect(
      experimentalResult.results.some(
        (result) => result.name === "ExperimentalWidget",
      ),
    ).toBe(false);
    expect(
      experimentalResult.results.some(
        (result) => result.name === "Experimental widget",
      ),
    ).toBe(false);
    expect(
      datePickerResult.results.some((result) => result.name === "DatePicker"),
    ).toBe(true);
  });

  it("returns icon matches for synonym-based icon searches", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "nodes process sequence",
      area: "icons",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "icon",
      name: "WorkflowIcon",
    });
  });

  it("searches country symbols as first-class entries", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "united states",
      area: "country_symbols",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "country_symbol",
      name: "United States of America (the)",
      package: "@salt-ds/countries",
    });
  });

  it("searches setup guides as first-class entries", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "getting started bootstrap",
      area: "guides",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "guide",
      name: "Developing with Salt",
    });
  });

  it("searches changelog-derived change entries", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "button keyboard active styling",
      area: "changes",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "change",
      package: "@salt-ds/core",
    });
  });

  it("searches site pages and returns matched excerpts for broad docs queries", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "wcag 2.1 aa standards",
      area: "pages",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "page",
    });
    expect(result.results[0]?.matched_excerpt?.toLowerCase()).toContain("wcag");
  });

  it("searches foundations as a first-class page area", () => {
    const result = searchSaltDocs(REGISTRY, {
      query: "typography hierarchy",
      area: "foundations",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "page",
      name: "Typography",
      source_url: "/salt/foundations/typography",
    });
  });

  it("keeps exact structured matches ahead of page hits when searching across all areas", () => {
    const searchRegistry: SaltRegistry = {
      ...REGISTRY,
      pages: [
        ...REGISTRY.pages,
        {
          id: "page.components-button",
          title: "Button docs",
          route: "/salt/components/button",
          page_kind: "component-doc",
          summary: "Everything you need to know about Button.",
          keywords: ["button", "actions"],
          content: [
            "Button is a primary action control used across Salt applications.",
            "Button Button Button Button Button.",
          ],
          section_headings: ["Button usage"],
          last_verified_at: TIMESTAMP,
        },
      ],
      search_index: [
        ...REGISTRY.search_index,
        {
          id: "page.components-button",
          type: "page",
          name: "Button docs",
          package: null,
          status: "stable",
          summary: "Everything you need to know about Button.",
          source_url: "/salt/components/button",
          keywords: ["button", "actions", "Button usage"],
        },
      ],
    };

    const result = searchSaltDocs(searchRegistry, {
      query: "Button",
      area: "all",
      top_k: 5,
    });

    expect(result.results[0]).toMatchObject({
      type: "component",
      name: "Button",
    });
  });
});

describe("getIcon", () => {
  it("returns ambiguity details when both variants share the same base icon name", () => {
    const result = getIcon(REGISTRY, {
      name: "workflow",
    });

    expect(result.icon).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "workflow",
      matched_by: "name",
    });
    expect(result.ambiguity?.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "WorkflowIcon",
          variant: "outline",
        }),
        expect.objectContaining({
          name: "WorkflowSolidIcon",
          variant: "solid",
        }),
      ]),
    );
  });

  it("returns ambiguity details when a shared synonym maps to both variants", () => {
    const result = getIcon(REGISTRY, {
      name: "nodes",
    });

    expect(result.icon).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "nodes",
      matched_by: "alias",
    });
  });

  it("returns an explicit solid icon lookup without ambiguity", () => {
    const result = getIcon(REGISTRY, {
      name: "workflow solid",
    });

    expect(result.icon).toMatchObject({
      name: "WorkflowSolidIcon",
      variant: "solid",
      related_docs: {
        foundation: "/salt/foundations/assets/index",
      },
    });
  });
});

describe("getIcons", () => {
  it("filters icons by query and variant", () => {
    const result = getIcons(REGISTRY, {
      query: "artificial intelligence",
      variant: "outline",
      max_results: 10,
    });

    expect(result.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "SparkleRefreshIcon",
          variant: "outline",
        }),
      ]),
    );
    expect(result.icons).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "WorkflowSolidIcon",
        }),
      ]),
    );
  });
});

describe("getCountrySymbol", () => {
  it("returns country symbol metadata for direct code lookups", () => {
    const result = getCountrySymbol(REGISTRY, {
      name: "US",
    });

    expect(result.country_symbol).toMatchObject({
      code: "US",
      name: "United States of America (the)",
      related_docs: {
        foundation: "/salt/foundations/assets/country-symbols",
      },
    });
  });

  it("falls back to fuzzy country-name matching when no exact alias exists", () => {
    const result = getCountrySymbol(REGISTRY, {
      name: "United States",
    });

    expect(result.country_symbol).toMatchObject({
      code: "US",
      name: "United States of America (the)",
    });
  });

  it("returns ambiguity details when a shared alias maps to multiple country symbols", () => {
    const result = getCountrySymbol(REGISTRY, {
      name: "Congo",
    });

    expect(result.country_symbol).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "Congo",
      matched_by: "alias",
    });
    expect(result.ambiguity?.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CD",
          name: "Congo (the Democratic Republic of the)",
        }),
        expect.objectContaining({
          code: "CG",
          name: "Congo (the)",
        }),
      ]),
    );
  });
});

describe("getCountrySymbols", () => {
  it("filters country symbols by query", () => {
    const result = getCountrySymbols(REGISTRY, {
      query: "england",
      max_results: 10,
    });

    expect(result.country_symbols).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "GB-ENG",
          name: "England",
        }),
      ]),
    );
    expect(result.country_symbols).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "US",
        }),
      ]),
    );
  });
});

describe("getComponent", () => {
  it("returns compact component data with optional sections", () => {
    const result = getComponent(REGISTRY, {
      name: "Button",
      include: ["props", "accessibility", "deprecations", "changes"],
      change_limit: 1,
    });

    expect(result.component).toMatchObject({
      name: "Button",
      summary: "Executes an action.",
      related_guides: expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
        expect.objectContaining({
          name: "Composition pitfalls",
          overview: "/salt/getting-started/composition-pitfalls",
        }),
      ]),
      next_step: "Review examples for Button before implementing.",
    });
    expect(result.component).toHaveProperty("props");
    expect(result.component).toHaveProperty("accessibility");
    expect(result.component).toHaveProperty("deprecation_records");
    expect(result.component).toHaveProperty("changes");
    expect(result.next_step).toBe(
      "Review examples for Button before implementing.",
    );
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_examples",
        }),
        expect.objectContaining({
          workflow: "create_salt_ui",
        }),
      ]),
    );
  });

  it("returns ambiguity details when an alias maps to multiple components", () => {
    const aliasRegistry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) => ({
        ...component,
        aliases: [...component.aliases, "Action control"],
      })),
    };

    const result = getComponent(aliasRegistry, {
      name: "Action control",
    });

    expect(result.component).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "Action control",
      matched_by: "alias",
    });
    expect(result.did_you_mean).toEqual(
      expect.arrayContaining([
        "Button (@salt-ds/core)",
        "Link (@salt-ds/core)",
      ]),
    );
    expect(result.ambiguity?.matches).toHaveLength(
      aliasRegistry.components.filter(isComponentAllowedByDocsPolicy).length,
    );
  });

  it("does not return undocumented lab components", () => {
    const result = getComponent(REGISTRY, {
      name: "ExperimentalWidget",
    });

    expect(result.component).toBeNull();
  });

  it("surfaces component guidance provenance in compact lookups", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "Button"
          ? {
              ...component,
              semantics: {
                category: ["actions"],
                preferred_for: ["Trigger an immediate action."],
                not_for: ["Use Link for navigation."],
                derived_from: ["component-category-map", "usage-docs"],
              },
            }
          : component,
      ),
    };

    const result = getComponent(registry, {
      name: "Button",
    });

    expect(result.component).toMatchObject({
      guidance_sources: ["component-category-map", "usage-docs"],
    });
  });
});

describe("getChanges", () => {
  it("returns recent component changes with version filtering", () => {
    const result = getChanges(REGISTRY, {
      target_type: "component",
      target_name: "Button",
      since_version: "2.0.1",
      limit: 10,
    });

    expect(result.resolved_target).toMatchObject({
      name: "Button",
      target_type: "component",
    });
    expect(result.changes).toEqual([
      expect.objectContaining({
        target_name: "Button",
        version: "2.0.1",
        kind: "fixed",
      }),
    ]);
  });

  it("returns ambiguity details for component aliases", () => {
    const aliasRegistry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.id === "component.button" || component.id === "component.link"
          ? {
              ...component,
              aliases: [...component.aliases, "Action control"],
            }
          : component,
      ),
    };

    const result = getChanges(aliasRegistry, {
      target_type: "component",
      target_name: "Action control",
    });

    expect(result.changes).toHaveLength(0);
    expect(result.ambiguity).toMatchObject({
      query: "Action control",
      target_type: "component",
    });
  });

  it("returns package changes when requested", () => {
    const result = getChanges(REGISTRY, {
      target_type: "package",
      target_name: "@salt-ds/core",
      limit: 10,
    });

    expect(result.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target_type: "package",
          package: "@salt-ds/core",
        }),
      ]),
    );
  });
});

describe("getPattern", () => {
  it("returns compact pattern details", () => {
    const result = getPattern(REGISTRY, {
      name: "Split button",
    });

    expect(result.pattern).toMatchObject({
      name: "Split button",
      status: "stable",
      how_to_build: expect.arrayContaining([
        "Use a primary button for the dominant action.",
      ]),
      next_step: "Review examples for Split button before implementing.",
    });
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_examples",
        }),
        expect.objectContaining({
          workflow: "create_salt_ui",
        }),
      ]),
    );
    expect(result.next_step).toBe(
      "Review examples for Split button before implementing.",
    );
  });

  it("matches pattern aliases and slugs", () => {
    const aliasResult = getPattern(REGISTRY, {
      name: "split action",
    });
    const slugResult = getPattern(REGISTRY, {
      name: "split-button",
    });

    expect(aliasResult.pattern).toMatchObject({
      name: "Split button",
    });
    expect(slugResult.pattern).toMatchObject({
      name: "Split button",
    });
  });

  it("surfaces pattern guidance provenance in compact lookups", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: REGISTRY.patterns.map((pattern) =>
        pattern.name === "Split button"
          ? {
              ...pattern,
              semantics: {
                category: ["actions-and-commands"],
                preferred_for: [
                  "One action is most likely, with secondary actions still available.",
                ],
                not_for: [],
                derived_from: [
                  "pattern-category-map",
                  "pattern-docs",
                  "usage-callouts",
                ],
              },
            }
          : pattern,
      ),
    };

    const result = getPattern(registry, {
      name: "Split button",
    });

    expect(result.pattern).toMatchObject({
      guidance_sources: [
        "pattern-category-map",
        "pattern-docs",
        "usage-callouts",
      ],
    });
  });
});

describe("getGuide", () => {
  it("returns structured setup guidance by alias", () => {
    const result = getGuide(REGISTRY, {
      name: "setup",
    });

    expect(result.guide).toMatchObject({
      name: "Developing with Salt",
      kind: "getting-started",
      packages: expect.arrayContaining([
        "@salt-ds/core",
        "@salt-ds/theme",
        "@salt-ds/icons",
      ]),
    });
  });

  it("finds the primitive decision guide by alias", () => {
    const result = getGuide(REGISTRY, {
      name: "button vs link",
    });

    expect(result.guide).toMatchObject({
      name: "Choosing the right primitive",
      related_docs: {
        overview: "/salt/getting-started/choosing-the-right-primitive",
      },
    });
  });

  it("finds the composition guide by wrapper alias", () => {
    const result = getGuide(REGISTRY, {
      name: "pass-through wrapper",
    });

    expect(result.guide).toMatchObject({
      name: "Composition pitfalls",
      related_docs: {
        overview: "/salt/getting-started/composition-pitfalls",
      },
    });
  });
});

describe("getPage", () => {
  it("returns a site page by route", () => {
    const result = getPage(REGISTRY, {
      name: "/salt/index",
    });

    expect(result.page).toMatchObject({
      title: "Salt Design System",
      route: "/salt/index",
      page_kind: "landing",
    });
  });

  it("keeps an exact page title match when later slug matches are ambiguous", () => {
    const ambiguousPageRegistry: SaltRegistry = {
      ...REGISTRY,
      pages: [
        ...REGISTRY.pages,
        {
          id: "page.about.typography",
          title: "Typography overview",
          route: "/salt/about/typography",
          page_kind: "about",
          summary: "Background on typography.",
          keywords: ["typography"],
          content: ["Typography background guidance."],
          section_headings: ["Overview"],
          last_verified_at: TIMESTAMP,
        },
        {
          id: "page.patterns.typography",
          title: "Typography patterns",
          route: "/salt/patterns/typography",
          page_kind: "pattern-doc",
          summary: "Pattern typography guidance.",
          keywords: ["typography"],
          content: ["Typography pattern guidance."],
          section_headings: ["Examples"],
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = getPage(ambiguousPageRegistry, {
      name: "Typography",
    });

    expect(result.page).toMatchObject({
      title: "Typography",
      route: "/salt/foundations/typography",
    });
    expect(result.ambiguity).toBeUndefined();
  });
});

describe("getFoundation", () => {
  it("returns a foundation page by slug-style lookup", () => {
    const result = getFoundation(REGISTRY, {
      name: "typography",
    });

    expect(result.foundation).toMatchObject({
      title: "Typography",
      docs: ["/salt/foundations/typography"],
    });
    expect(result.next_step).toBe(
      "Apply the typography guidance to the current layout or component.",
    );
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "discover_salt",
        }),
      ]),
    );
  });

  it("can return starter code for applying a foundation", () => {
    const result = getFoundation(REGISTRY, {
      name: "typography",
      include_starter_code: true,
    });

    expect(result.starter_code?.[0]).toMatchObject({
      language: "tsx",
      label: "Typography starter",
    });
    expect(result.starter_code?.[0]?.code).toContain(
      'import { Text } from "@salt-ds/core";',
    );
  });
});

describe("getPackage", () => {
  it("can include recent package changes", () => {
    const result = getPackage(REGISTRY, {
      name: "@salt-ds/core",
      include: ["changes"],
      change_limit: 2,
    });

    expect(result.package).toMatchObject({
      name: "@salt-ds/core",
    });
    expect(result.package).toHaveProperty("changes");
  });
});

describe("listSaltCatalog", () => {
  it("lists guides separately from search and reports filtered counts", () => {
    const result = listSaltCatalog(REGISTRY, {
      area: "guides",
      max_results: 10,
    });

    expect(result.total).toBe(1);
    expect(result.counts.guide).toBe(1);
    expect(result.items[0]).toMatchObject({
      type: "guide",
      name: "Developing with Salt",
    });
  });

  it("lists change entries as a first-class catalog area", () => {
    const result = listSaltCatalog(REGISTRY, {
      area: "changes",
      max_results: 10,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.counts.change).toBeGreaterThan(0);
    expect(result.items[0]?.type).toBe("change");
  });

  it("lists site pages as a first-class catalog area", () => {
    const result = listSaltCatalog(REGISTRY, {
      area: "pages",
      max_results: 10,
    });

    expect(result.total).toBe(3);
    expect(result.counts.page).toBe(3);
    expect(result.items[0]?.type).toBe("page");
  });

  it("lists foundations as a filtered page catalog area", () => {
    const result = listSaltCatalog(REGISTRY, {
      area: "foundations",
      max_results: 10,
    });

    expect(result.total).toBe(1);
    expect(result.counts.page).toBe(1);
    expect(result.items[0]).toMatchObject({
      type: "page",
      name: "Typography",
    });
  });

  it("lists country symbols as a first-class catalog area", () => {
    const result = listSaltCatalog(REGISTRY, {
      area: "country_symbols",
      max_results: 10,
    });

    expect(result.total).toBe(4);
    expect(result.counts.country_symbol).toBe(4);
    expect(result.items[0]?.type).toBe("country_symbol");
  });
});

describe("getExamples", () => {
  it("matches canonical targets against slug-style example names", () => {
    const legacyRegistry: SaltRegistry = {
      ...REGISTRY,
      examples: [
        {
          ...REGISTRY.examples[0],
          target_name: "button",
        },
        {
          id: "pattern-story.split-button.primary",
          title: "Primary action",
          intent: ["pattern example"],
          complexity: "intermediate",
          code: "// split button story",
          source_url: null,
          package: "@salt-ds/core",
          target_type: "pattern",
          target_name: "split-button",
        },
      ],
    };

    const componentExamples = getExamples(legacyRegistry, {
      target_type: "component",
      target_name: "Button",
    });
    const patternExamples = getExamples(legacyRegistry, {
      target_type: "pattern",
      target_name: "Split button",
    });

    expect(componentExamples.examples).toHaveLength(1);
    expect(patternExamples.examples).toHaveLength(1);
    expect(componentExamples.resolved_target).toMatchObject({
      name: "Button",
      target_type: "component",
    });
    expect(patternExamples.examples[0]).toMatchObject({
      target: {
        type: "pattern",
        name: "split-button",
      },
    });
  });

  it("returns ambiguity details instead of broadening across multiple targets", () => {
    const aliasRegistry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.id === "component.button" || component.id === "component.link"
          ? {
              ...component,
              aliases: [...component.aliases, "Action target"],
            }
          : component,
      ),
    };

    const result = getExamples(aliasRegistry, {
      target_type: "component",
      target_name: "Action target",
    });

    expect(result.examples).toHaveLength(0);
    expect(result.ambiguity).toMatchObject({
      query: "Action target",
    });
    expect(result.ambiguity?.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target_type: "component",
          name: "Button",
          matched_by: ["alias"],
        }),
        expect.objectContaining({
          target_type: "component",
          name: "Link",
          matched_by: ["alias"],
        }),
      ]),
    );
  });

  it("filters undocumented lab component examples while keeping documented ones", () => {
    const result = getExamples(REGISTRY, {
      package: "@salt-ds/lab",
      max_results: 10,
    });

    expect(result.examples).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: {
            type: "component",
            name: "DatePicker",
          },
        }),
      ]),
    );
    expect(result.examples).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: {
            type: "component",
            name: "ExperimentalWidget",
          },
        }),
      ]),
    );
  });
});

describe("listFoundations", () => {
  it("returns foundation pages filtered by query", () => {
    const result = listFoundations(REGISTRY, {
      query: "type scale",
      max_results: 10,
    });

    expect(result.total).toBe(1);
    expect(result.foundations[0]).toMatchObject({
      title: "Typography",
      route: "/salt/foundations/typography",
    });
  });
});

describe("searchApiSurface", () => {
  it("finds matching props by prop name and component filter", () => {
    const apiRegistry: SaltRegistry = {
      ...REGISTRY,
      components: [
        ...REGISTRY.components,
        {
          id: "component.input",
          name: "Input",
          aliases: ["text field"],
          package: {
            name: "@salt-ds/core",
            status: "stable",
            since: "1.0.0",
          },
          summary: "Collects short text input.",
          status: "stable",
          category: ["inputs"],
          tags: ["form", "text"],
          when_to_use: ["Capture short-form text."],
          when_not_to_use: ["Use MultilineInput for longer content."],
          alternatives: [],
          props: [
            {
              name: "validationStatus",
              type: '"error" | "warning" | "success"',
              required: false,
              description: "Controls the validation styling for the field.",
              default: null,
              allowed_values: ["error", "warning", "success"],
              deprecated: false,
            },
            {
              name: "readOnly",
              type: "boolean",
              required: false,
              description:
                "Prevents editing while keeping the value focusable.",
              default: "false",
              deprecated: false,
            },
          ],
          accessibility: {
            summary: ["Associate the field with a visible label."],
            rules: [],
          },
          tokens: [],
          patterns: ["Forms"],
          examples: [],
          related_docs: {
            overview: "/salt/components/input",
            usage: "/salt/components/input/usage",
            accessibility: "/salt/components/input/accessibility",
            examples: "/salt/components/input/examples",
          },
          source: {
            repo_path: "packages/core/src/input",
            export_name: "Input",
          },
          deprecations: [],
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = searchApiSurface(apiRegistry, {
      query: "validationStatus",
      component_name: "input",
      top_k: 10,
    });

    expect(result.total_matches).toBe(1);
    expect(result.matches[0]).toMatchObject({
      component: {
        name: "Input",
        package: "@salt-ds/core",
      },
      prop: {
        name: "validationStatus",
      },
    });
  });

  it("can filter deprecated props only", () => {
    const result = searchApiSurface(REGISTRY, {
      query: "variant",
      deprecated: true,
      top_k: 10,
    });

    expect(result.total_matches).toBe(1);
    expect(result.matches[0]).toMatchObject({
      component: {
        name: "Button",
      },
      prop: {
        name: "variant",
        deprecated: true,
      },
    });
  });

  it("normalizes component_name filters across spaces, hyphens, and camel case", () => {
    const apiRegistry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "DatePicker"
          ? {
              ...component,
              props: [
                {
                  name: "validationStatus",
                  type: '"error" | "warning" | "success"',
                  required: false,
                  description:
                    "Controls the validation styling for the date picker.",
                  default: null,
                  allowed_values: ["error", "warning", "success"],
                  deprecated: false,
                },
              ],
            }
          : component,
      ),
    };

    const result = searchApiSurface(apiRegistry, {
      query: "validationStatus",
      component_name: "date picker",
      top_k: 10,
    });

    expect(result.total_matches).toBe(1);
    expect(result.matches[0]).toMatchObject({
      component: {
        name: "DatePicker",
      },
      prop: {
        name: "validationStatus",
      },
    });
  });
});

describe("getToken", () => {
  it("filters tokens by semantic intent", () => {
    const result = getToken(REGISTRY, {
      category: "color",
      semantic_intent: "warning",
    });

    expect(result.source_url).toBe("/salt/themes/design-tokens/index");
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0]).toMatchObject({
      name: "--salt-color-warning-foreground",
      category: "color",
      semantic_intent: "warning",
    });
  });

  it("uses exact matching by default and exposes contains-mode truncation", () => {
    const tokenRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
        ...REGISTRY.tokens,
        {
          name: "--salt-color-warning-background",
          category: "color",
          type: "color",
          value: "#fef3c7",
          semantic_intent: "warning background",
          themes: ["salt", "next"],
          densities: ["high", "medium", "low", "touch"],
          applies_to: ["Badge"],
          guidance: ["Use for warning surfaces."],
          aliases: [],
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const exactResult = getToken(tokenRegistry, {
      category: "color",
      semantic_intent: "warning",
    });
    const containsResult = getToken(tokenRegistry, {
      category: "color",
      semantic_intent: "warning",
      semantic_intent_match: "contains",
      max_results: 1,
    });

    expect(exactResult.total_matches).toBe(1);
    expect(containsResult.total_matches).toBe(2);
    expect(containsResult.truncated).toBe(true);
    expect(containsResult.source_url).toBe("/salt/themes/design-tokens/index");
    expect(containsResult.tokens).toHaveLength(1);
  });

  it("surfaces token policy metadata and policy docs when available", () => {
    const tokenRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
        ...REGISTRY.tokens,
        {
          name: "--salt-palette-accent-border",
          category: "palette",
          type: "color",
          value: "#1d4ed8",
          semantic_intent: null,
          themes: ["salt", "next"],
          densities: [],
          applies_to: [],
          guidance: ["Intermediate palette token."],
          aliases: [],
          policy: {
            usage_tier: "palette",
            direct_component_use: "never",
            preferred_for: [
              "internal theme and mode mapping inside the Salt token system",
            ],
            avoid_for: ["direct component styling"],
            notes: [
              "Palette tokens sit between foundations and characteristics and should not be referenced directly in components or patterns.",
            ],
            docs: ["/salt/themes/design-tokens/index"],
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = getToken(tokenRegistry, {
      name: "--salt-palette-accent-border",
      max_results: 1,
    });

    expect(result.tokens[0]).toMatchObject({
      name: "--salt-palette-accent-border",
      policy: {
        usage_tier: "palette",
        direct_component_use: "never",
      },
    });
    expect(result.tokens[0]).toMatchObject({
      docs: ["/salt/themes/design-tokens/index"],
    });
  });
});

describe("consumer tools", () => {
  it("returns consumer-clean example output by default", () => {
    const result = getExamples(REGISTRY, {
      target_type: "component",
      target_name: "Button",
      max_results: 10,
    });

    expect(result.examples[0]).toMatchObject({
      target: {
        type: "component",
        name: "Button",
      },
      tags: [],
    });
    expect(result.examples[0]).not.toHaveProperty("framework_hints");
    expect(result.examples[0]).not.toHaveProperty("repo_source_candidates");
    expect(result.best_example).toMatchObject({
      title: "Primary form submit",
    });
    expect(result.why_this_example).toContain("directly targets Button");
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_entity",
        }),
      ]),
    );
    expect(result.next_step).toBe(
      "Open the examples for Button and adapt the closest scenario.",
    );
  });

  it("picks a best example and nearby variants for the same target", () => {
    const multiExampleRegistry: SaltRegistry = {
      ...REGISTRY,
      examples: [
        ...REGISTRY.examples,
        {
          id: "button.secondary.action",
          title: "Secondary button action",
          intent: ["secondary action"],
          complexity: "basic",
          code: '<Button appearance="bordered">Cancel</Button>',
          source_url: "/salt/components/button/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Button",
        },
      ],
    };

    const result = getExamples(multiExampleRegistry, {
      target_type: "component",
      target_name: "Button",
      max_results: 10,
    });

    expect(result.best_example).toMatchObject({
      title: "Primary form submit",
    });
    expect(result.nearby_examples?.[0]).toMatchObject({
      title: "Secondary button action",
    });
  });

  it("returns full example metadata when requested", () => {
    const result = getExamples(REGISTRY, {
      target_type: "component",
      target_name: "Button",
      max_results: 10,
      view: "full",
    });

    expect(result.examples[0]).toMatchObject({
      target_name: "Button",
      framework_hints: ["react"],
      package_hints: ["@salt-ds/core"],
      repo_source_candidates: [
        "packages/core/stories/button/button.stories.tsx",
      ],
    });
  });

  it("recommends components from consumer task language", () => {
    const result = recommendComponent(REGISTRY, {
      task: "navigate to another route",
      top_k: 3,
    });

    expect(result.recommended).toMatchObject({
      name: "Link",
      why: expect.any(String),
      related_guides: expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    });
    expect(result.recommended).toMatchObject({
      ship_check: {
        stable_for_production: true,
        accessibility_guidance: true,
      },
      caveats: expect.any(Array),
    });
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_examples",
        }),
        expect.objectContaining({
          workflow: "get_salt_entity",
        }),
      ]),
    );
    expect(result.next_step).toBe(
      "Review examples for Link and confirm it fits your task.",
    );
  });

  it("can return starter code for the primary component recommendation", () => {
    const result = recommendComponent(REGISTRY, {
      task: "navigate to another route",
      top_k: 3,
      include_starter_code: true,
    });

    expect(result.starter_code?.[0]).toMatchObject({
      language: "tsx",
      label: "Link starter",
    });
    expect(result.starter_code?.[0]?.code).toContain(
      'import { Link } from "@salt-ds/core";',
    );
  });

  it("can enforce production-ready filters on component recommendations", () => {
    const result = recommendComponent(REGISTRY, {
      task: "use when evaluating lab date entry patterns",
      package: "@salt-ds/lab",
      top_k: 3,
      production_ready: true,
    });

    expect(result.recommended).toBeNull();
    expect(result.next_step).toBe(
      "Broaden the task description or try discover_salt for related guidance.",
    );
  });

  it("can return full component recommendation metadata when requested", () => {
    const result = recommendComponent(REGISTRY, {
      task: "navigate to another route",
      top_k: 3,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      component: {
        name: "Link",
      },
      related_guides: expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    });
  });

  it("returns a pattern-first composition recipe", () => {
    const result = getCompositionRecipe(REGISTRY, {
      query: "primary action with alternatives",
      top_k: 2,
    });

    expect(result.recommended).toMatchObject({
      name: "Split button",
      type: "pattern",
    });
    expect(result.next_step).toContain("Split button");
  });

  it("uses pattern semantics to break ties between similar pattern candidates", () => {
    const splitButton = REGISTRY.patterns.find(
      (pattern) => pattern.name === "Split button",
    );
    expect(splitButton).toBeDefined();
    if (!splitButton) {
      throw new Error("Expected Split button pattern");
    }

    const sharedPatternFields = {
      summary:
        "A grouped action control for a dominant action with fallback options.",
      when_to_use: [
        "Use when a UI groups a dominant action with fallback options.",
      ],
      how_to_build: [
        "Keep the dominant action visible.",
        "Expose fallback options from a related trigger.",
      ],
      how_it_works: [
        "One trigger handles the dominant action.",
        "A related trigger reveals fallback options.",
      ],
      composed_of: [
        { component: "Button", role: "dominant action" },
        { component: "Menu", role: "fallback options" },
      ],
    };
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        {
          ...splitButton,
          ...sharedPatternFields,
          examples: [
            {
              id: "pattern.split-button.semantic",
              title: "Grouped action with fallback options",
              intent: ["dominant action with fallback options"],
              complexity: "intermediate",
              code: "// grouped action example",
              source_url: "/salt/patterns/split-button/examples",
              package: "@salt-ds/core",
              target_type: "pattern",
              target_name: "Split button",
            },
          ],
          semantics: {
            category: ["actions-and-commands"],
            preferred_for: [
              "Use when a UI groups a dominant action with fallback options.",
            ],
            not_for: ["Use when multiple actions are equal in importance."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
        },
        {
          ...splitButton,
          ...sharedPatternFields,
          id: "pattern.action-cluster",
          name: "Action cluster",
          aliases: ["action cluster"],
          related_patterns: [],
          related_docs: {
            overview: "/salt/patterns/action-cluster",
          },
          resources: [],
          examples: [
            {
              id: "pattern.action-cluster.example",
              title: "Grouped action cluster",
              intent: ["dominant action with fallback options"],
              complexity: "intermediate",
              code: "// grouped action example",
              source_url: "/salt/patterns/action-cluster/examples",
              package: "@salt-ds/core",
              target_type: "pattern",
              target_name: "Action cluster",
            },
          ],
          semantics: {
            category: ["actions-and-commands"],
            preferred_for: [
              "Use when multiple actions are equal in importance.",
            ],
            not_for: [
              "Use when a UI groups a dominant action with fallback options.",
            ],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
        },
      ],
    };

    const result = getCompositionRecipe(registry, {
      query: "dominant action with fallback options",
      top_k: 2,
      view: "full",
    });

    expect(result.recipes?.[0]).toMatchObject({
      name: "Split button",
      guidance_sources: ["pattern-category-map", "pattern-docs"],
      match_reasons: expect.arrayContaining(["semantics_preferred_for_phrase"]),
    });
    expect(result.recipes?.[1]).toMatchObject({
      name: "Action cluster",
      match_reasons: expect.arrayContaining(["semantics_not_for_penalty"]),
    });
  });

  it("can return starter code for the best composition recipe", () => {
    const result = getCompositionRecipe(REGISTRY, {
      query: "primary action with alternatives",
      top_k: 2,
      include_starter_code: true,
    });

    expect(result.starter_code?.[0]).toMatchObject({
      language: "tsx",
      label: "Split button starter",
    });
    expect(result.starter_code?.[0]?.code).toContain("SaltProviderNext");
    expect(result.starter_code?.[0]?.code).toContain(
      'import "@salt-ds/theme/css/theme-next.css";',
    );
    expect(result.starter_code?.[0]?.code).toContain('accent="teal"');
    expect(result.starter_code?.[0]?.code).toContain("Button, Menu");
    expect(result.starter_code?.[0]?.notes).toContain(
      "Use the recommended JPM Brand theme bootstrap for new Salt work. Only fall back to legacy SaltProvider when migration compatibility or repo policy explicitly requires it.",
    );
    expect(result.starter_code?.[1]).toMatchObject({
      label: "Basic split button example",
    });
  });

  it("preserves the analytical dashboard scaffold when starter code is requested", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.analytical-dashboard",
          name: "Analytical dashboard",
          aliases: ["analytical-dashboard"],
          summary: "Dashboard pattern",
          status: "stable",
          category: ["data-display-and-analysis", "layout-and-shells"],
          when_to_use: ["Use for analytical dashboards."],
          when_not_to_use: [],
          composed_of: [
            { component: "Border layout", role: null },
            { component: "Flow layout", role: null },
            { component: "Stack layout", role: null },
            { component: "Tabs", role: null },
          ],
          related_patterns: [],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            fidelity: "hybrid",
            semantics: {
              regions: [
                "dashboard-header",
                "key-metrics",
                "fixed-panel",
                "main-body",
              ],
              build_around: [
                "Dashboard header region",
                "Key metrics bar",
                "Main body modules arranged as dashboard widgets",
              ],
              preserve_constraints: [
                "Keep the header, key metrics, fixed controls, and main body visually distinct.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "BorderLayout", package: "@salt-ds/core" },
                { name: "BorderItem", package: "@salt-ds/core" },
                { name: "Card", package: "@salt-ds/core" },
                { name: "FlowLayout", package: "@salt-ds/core" },
                { name: "GridItem", package: "@salt-ds/core" },
                { name: "GridLayout", package: "@salt-ds/core" },
                { name: "StackLayout", package: "@salt-ds/core" },
                { name: "Text", package: "@salt-ds/core" },
                { name: "Tabs", package: "@salt-ds/lab" },
              ],
              jsx_lines: [
                "<BorderLayout>",
                '  <BorderItem position="north" as="header">',
                "    <StackLayout>{/* Dashboard header region: title, context, and utilities */}</StackLayout>",
                "  </BorderItem>",
                '  <BorderItem position="west" as="aside">',
                "    <StackLayout>{/* Fixed panel: filters, toggles, and controls */}</StackLayout>",
                "  </BorderItem>",
                '  <BorderItem position="center" as="main">',
                "    <StackLayout>",
                '      <section aria-label="Key metrics bar">',
                "        <FlowLayout>{/* Key metrics bar: 3-5 concise metrics in one orientation */}",
                "          <StackLayout>{/* Metric 1 */}",
                "            <Text>{/* Metric title */}Net asset value</Text>",
                "            <Text>{/* Large metric value */}£124.8m</Text>",
                "            <Text>{/* Metric subtitle or subvalue */}+2.4% vs previous close</Text>",
                "          </StackLayout>",
                "        </FlowLayout>",
                "      </section>",
                '      <GridLayout columns={12} gap={3} aria-label="Dashboard modules">',
                "        <GridItem colSpan={8}><Card>{/* Primary analytical module */}</Card></GridItem>",
                "      </GridLayout>",
                "      <Tabs />",
                "    </StackLayout>",
                "  </BorderItem>",
                "</BorderLayout>",
              ],
              notes: [
                "Start from the dashboard regions rather than composing unrelated widgets ad hoc.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/analytical-dashboard" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const pattern = registry.patterns.find(
      (entry) => entry.name === "Analytical dashboard",
    );
    expect(pattern).toBeDefined();
    if (!pattern) {
      throw new Error("Expected Analytical dashboard pattern");
    }

    const recipe = buildPatternRecipe(registry, pattern, 100, [], []);
    const starterCode = toRecipeStarterCode(recipe);

    expect(starterCode?.[0]?.code).toContain("<BorderLayout>");
    expect(starterCode?.[0]?.code).toContain('<BorderItem position="north"');
    expect(starterCode?.[0]?.code).toContain('<BorderItem position="center"');
    expect(starterCode?.[0]?.code).toContain("<GridLayout columns={12}");
    expect(starterCode?.[0]?.code).toContain("Metric subtitle or subvalue");
    expect(starterCode?.[0]?.code).toContain(
      "Fixed panel: filters, toggles, and controls",
    );
  });

  it("falls back to generic composition when a pattern scaffold is still draft quality", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.draft-shell",
          name: "Draft shell",
          aliases: ["draft-shell"],
          summary: "Draft shell pattern",
          status: "stable",
          category: ["layout-and-shells"],
          when_to_use: ["Use for a shell with two related controls."],
          when_not_to_use: [],
          composed_of: [
            { component: "Button", role: "primary action" },
            { component: "Link", role: "secondary navigation" },
          ],
          related_patterns: [],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            fidelity: "draft",
            semantics: {
              regions: ["shell"],
              build_around: ["Draft shell"],
              preserve_constraints: ["Draft only."],
            },
            template: {
              kind: "fallback-template",
              imports: [{ name: "StackLayout", package: "@salt-ds/core" }],
              jsx_lines: ["<StackLayout>{/* draft */}</StackLayout>"],
              notes: ["Draft scaffold."],
            },
          },
          related_docs: { overview: "/salt/patterns/draft-shell" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const pattern = registry.patterns.find(
      (entry) => entry.name === "Draft shell",
    );
    expect(pattern).toBeDefined();
    if (!pattern) {
      throw new Error("Expected Draft shell pattern");
    }

    const recipe = buildPatternRecipe(registry, pattern, 100, [], []);
    const starterCode = toRecipeStarterCode(recipe);

    expect(starterCode?.[0]?.code).toContain(
      'import { Button, Link, SaltProviderNext } from "@salt-ds/core";',
    );
    expect(starterCode?.[0]?.code).toContain("<Button>Primary action</Button>");
    expect(starterCode?.[0]?.code).toContain(
      '<Link href="/next">Go to next page</Link>',
    );
    expect(starterCode?.[0]?.code).not.toContain("{/* draft */}");
    expect(starterCode?.[0]?.notes).toContain(
      "This pattern currently falls back to generic starter composition because the attached scaffold is still draft quality.",
    );
  });

  it("preserves the metric anatomy when starter code is requested", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.metric",
          name: "Metric",
          aliases: ["metric"],
          summary: "Metric pattern",
          status: "stable",
          category: ["data-display-and-analysis"],
          when_to_use: ["Use to emphasize a KPI or summary value."],
          when_not_to_use: [],
          composed_of: [
            { component: "Text", role: "metric value" },
            { component: "Stack layout", role: "metric structure" },
          ],
          related_patterns: [],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            fidelity: "hybrid",
            semantics: {
              regions: [
                "metric-title",
                "metric-value",
                "metric-supporting-context",
              ],
              build_around: [
                "Prominent metric value",
                "Supporting title plus subtitle or subvalue",
                "Single consistent orientation for the metric content",
              ],
              preserve_constraints: [
                "Keep the metric value visually dominant over the supporting context.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "StackLayout", package: "@salt-ds/core" },
                { name: "Text", package: "@salt-ds/core" },
              ],
              jsx_lines: [
                "<StackLayout>{/* Vertical metric */}",
                "  <Text>{/* Metric title */}Portfolio value</Text>",
                "  <Text>{/* Large metric value */}£124.8m</Text>",
                "  <Text>{/* Subtitle or subvalue */}+2.4% vs previous close</Text>",
                "</StackLayout>",
              ],
              notes: [
                "Build the metric around the value, title, and supporting subtitle or subvalue rather than treating it as generic text.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/metric" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const pattern = registry.patterns.find((entry) => entry.name === "Metric");
    expect(pattern).toBeDefined();
    if (!pattern) {
      throw new Error("Expected Metric pattern");
    }

    const recipe = buildPatternRecipe(registry, pattern, 100, [], []);
    const starterCode = toRecipeStarterCode(recipe);

    expect(starterCode?.[0]?.code).toContain("Vertical metric");
    expect(starterCode?.[0]?.code).toContain("Metric title");
    expect(starterCode?.[0]?.code).toContain("Large metric value");
    expect(starterCode?.[0]?.code).toContain("Subtitle or subvalue");
    expect(starterCode?.[0]?.notes).toContain(
      "Build the metric around the value, title, and supporting subtitle or subvalue rather than treating it as generic text.",
    );
  });

  it("preserves the app header shell when starter code is requested", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.app-header",
          name: "App header",
          aliases: ["app-header"],
          summary: "App header pattern",
          status: "stable",
          category: ["layout-and-shells", "navigation-and-wayfinding"],
          when_to_use: ["Use as the primary element to orient users."],
          when_not_to_use: [],
          composed_of: [
            { component: "Navigation item", role: null },
            { component: "Button", role: null },
          ],
          related_patterns: ["Navigation", "Vertical navigation"],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            fidelity: "hybrid",
            semantics: {
              regions: ["branding", "primary-navigation", "utility-actions"],
              build_around: [
                "Persistent app header shell",
                "Primary navigation region",
                "Utility actions region",
              ],
              preserve_constraints: [
                "Keep branding, navigation, and utility actions as distinct regions.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "Button", package: "@salt-ds/core" },
                { name: "NavigationItem", package: "@salt-ds/core" },
                { name: "StackLayout", package: "@salt-ds/core" },
              ],
              jsx_lines: [
                "<header>",
                '  <StackLayout direction="row" align="center">',
                '    <a href="/">{/* Branding: logo or mark plus app name */}</a>',
                '    <nav aria-label="Primary">',
                '      <NavigationItem href="/overview">Overview</NavigationItem>',
                '      <NavigationItem href="/reports">Reports</NavigationItem>',
                "    </nav>",
                '    <StackLayout direction="row">',
                '      <Button appearance="secondary">Search</Button>',
                '      <Button appearance="secondary">Settings</Button>',
                "    </StackLayout>",
                "  </StackLayout>",
                "</header>",
              ],
              notes: [
                "Keep the header shell recognizable instead of reducing it to isolated navigation and action components.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/app-header" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const pattern = registry.patterns.find(
      (entry) => entry.name === "App header",
    );
    expect(pattern).toBeDefined();
    if (!pattern) {
      throw new Error("Expected App header pattern");
    }

    const recipe = buildPatternRecipe(registry, pattern, 100, [], []);
    const starterCode = toRecipeStarterCode(recipe);

    expect(starterCode?.[0]?.code).toContain('<nav aria-label="Primary">');
    expect(starterCode?.[0]?.code).toContain(
      "Branding: logo or mark plus app name",
    );
    expect(starterCode?.[0]?.notes).toContain(
      "Keep the header shell recognizable instead of reducing it to isolated navigation and action components.",
    );
  });

  it("preserves the vertical navigation shell when starter code is requested", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.vertical-navigation",
          name: "Vertical navigation",
          aliases: ["vertical-navigation"],
          summary: "Vertical navigation pattern",
          status: "stable",
          category: ["layout-and-shells", "navigation-and-wayfinding"],
          when_to_use: ["Use for structured multilevel navigation."],
          when_not_to_use: [],
          composed_of: [
            { component: "Vertical navigation", role: null },
            { component: "Border layout", role: null },
          ],
          related_patterns: ["Navigation"],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            fidelity: "hybrid",
            semantics: {
              regions: [
                "navigation-pane",
                "nested-navigation",
                "content-context",
              ],
              build_around: [
                "Fixed or responsive navigation pane",
                "Stacked navigation item hierarchy inside the pane",
                "Main content area that stays distinct from the navigation tree",
              ],
              preserve_constraints: [
                "Keep navigation items grouped inside a dedicated pane rather than scattering links through the page body.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "BorderLayout", package: "@salt-ds/core" },
                { name: "NavigationItem", package: "@salt-ds/core" },
                { name: "StackLayout", package: "@salt-ds/core" },
              ],
              jsx_lines: [
                "<BorderLayout>",
                "  <aside>{/* Navigation pane: fixed or responsive depending on the app shell */}",
                '    <nav aria-label="Primary">',
                "      <StackLayout>",
                '        <NavigationItem href="/overview">Overview</NavigationItem>',
                "        <NavigationItem>{/* Parent section that reveals nested items */}</NavigationItem>",
                "      </StackLayout>",
                "    </nav>",
                "  </aside>",
                "  <main>",
                "    <StackLayout>{/* Main content area stays distinct from the navigation tree */}</StackLayout>",
                "  </main>",
                "</BorderLayout>",
              ],
              notes: [
                "Start from the pane and navigation hierarchy rather than reducing the pattern to loose links or an unrelated page list.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/vertical-navigation" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const pattern = registry.patterns.find(
      (entry) => entry.name === "Vertical navigation",
    );
    expect(pattern).toBeDefined();
    if (!pattern) {
      throw new Error("Expected Vertical navigation pattern");
    }

    const recipe = buildPatternRecipe(registry, pattern, 100, [], []);
    const starterCode = toRecipeStarterCode(recipe);

    expect(starterCode?.[0]?.code).toContain('<nav aria-label="Primary">');
    expect(starterCode?.[0]?.code).toContain("<NavigationItem");
    expect(starterCode?.[0]?.code).toContain(
      "Navigation pane: fixed or responsive depending on the app shell",
    );
    expect(starterCode?.[0]?.notes).toContain(
      "Start from the pane and navigation hierarchy rather than reducing the pattern to loose links or an unrelated page list.",
    );
  });

  it("includes caveats, ship checks, and follow-ups on composition recipes", () => {
    const result = getCompositionRecipe(REGISTRY, {
      query: "primary action with alternatives",
      top_k: 2,
    });

    expect(result.recommended).toMatchObject({
      name: "Split button",
      ship_check: {
        stable_for_production: true,
        accessibility_guidance: true,
      },
    });
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_examples",
        }),
        expect.objectContaining({
          workflow: "get_salt_entity",
        }),
      ]),
    );
  });

  it("compares consumer options side by side", () => {
    const result = compareOptions(REGISTRY, {
      option_type: "component",
      names: ["Button", "Link"],
      task: "navigate to another route",
    });

    expect(result.recommendation).toMatchObject({
      name: "Link",
    });
    expect(result.compared).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Link",
          ship_check: expect.objectContaining({
            stable_for_production: true,
          }),
          related_guides: expect.arrayContaining([
            expect.objectContaining({
              name: "Choosing the right primitive",
            }),
          ]),
        }),
      ]),
    );
    expect(result.differences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          criterion: "Accessibility guidance",
        }),
      ]),
    );
    expect(result.related_guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    );
  });

  it("does not silently compare when one option cannot be resolved", () => {
    const result = compareOptions(REGISTRY, {
      option_type: "component",
      names: ["Button", "MadeUp"],
      task: "navigate to another route",
    });

    expect(result.compared).toEqual([]);
    expect(result.unresolved_names).toEqual(["MadeUp"]);
    expect(result.recommendation).toBeUndefined();
    expect(result.next_step).toBe(
      "Retry with exact component names or start from create_salt_ui.",
    );
  });

  it("requires at least two names for a real comparison", () => {
    const result = compareOptions(REGISTRY, {
      option_type: "component",
      names: ["Button"],
    });

    expect(result.compared).toEqual([]);
    expect(result.next_step).toBe(
      "Provide at least two exact component names to compare, or start from create_salt_ui.",
    );
  });

  it("translates external or generic UI descriptions into Salt targets", () => {
    const translationRegistry: SaltRegistry = {
      ...REGISTRY,
      components: [
        ...REGISTRY.components,
        {
          id: "component.input",
          name: "Input",
          aliases: ["text field"],
          package: {
            name: "@salt-ds/core",
            status: "stable",
            since: "1.0.0",
          },
          summary: "Collects short text input.",
          status: "stable",
          category: ["inputs"],
          tags: ["form", "text"],
          when_to_use: ["Capture short-form text."],
          when_not_to_use: ["Use MultilineInput for longer content."],
          alternatives: [],
          props: [],
          accessibility: {
            summary: ["Associate Input with a visible label or FormField."],
            rules: [],
          },
          tokens: [],
          patterns: [],
          examples: [
            {
              id: "input.basic",
              title: "Basic input",
              intent: ["capture short text"],
              complexity: "basic",
              code: '<Input aria-label="Search" />',
              source_url: "/salt/components/input/examples",
              package: "@salt-ds/core",
              target_type: "component",
              target_name: "Input",
            },
          ],
          related_docs: {
            overview: "/salt/components/input",
            usage: "/salt/components/input/usage",
            accessibility: "/salt/components/input/accessibility",
            examples: "/salt/components/input/examples",
          },
          source: {
            repo_path: "packages/core/src/input",
            export_name: "Input",
          },
          deprecations: [],
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = migrateToSalt(translationRegistry, {
      code: `
        import { Button as MuiButton, Menu } from "@mui/material";
        import { Link } from "react-router-dom";

        export function Demo() {
          return (
            <>
              <MuiButton onClick={() => console.log("save")}>Save</MuiButton>
              <Link to="/next">Next</Link>
              <input aria-label="Search" />
              <Menu />
            </>
          );
        }
      `,
      include_starter_code: true,
    });

    expect(result.source_profile).toMatchObject({
      detected_libraries: expect.arrayContaining([
        "@mui/material",
        "react-router-dom",
      ]),
      ui_flavor: "external-ui",
    });
    expect(result.source_ui_model).toMatchObject({
      summary: {
        translation_mode: "scaffold-from-code",
        dominant_scope: "control",
      },
      ui_regions: expect.arrayContaining([
        expect.objectContaining({
          kind: "split-action",
          scope: "flow",
          complexity: "multi-part",
        }),
        expect.objectContaining({
          kind: "text-input",
          scope: "control",
          role: "data-entry",
        }),
      ]),
    });
    expect(result.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_model_ref: "source-ui-1",
          source_kind: "split-action",
          migration_kind: "pattern",
          implementation: expect.objectContaining({
            readiness: "medium",
            starter_code_available: true,
          }),
          salt_target: expect.objectContaining({
            name: "Split button",
          }),
        }),
        expect.objectContaining({
          source_kind: "navigation",
          migration_kind: "direct",
          salt_target: expect.objectContaining({
            name: "Link",
          }),
        }),
        expect.objectContaining({
          source_kind: "text-input",
          migration_kind: "direct",
          salt_target: expect.objectContaining({
            name: "Input",
          }),
        }),
      ]),
    );
    expect(result.implementation_plan).toMatchObject({
      direct_swaps: expect.arrayContaining([
        expect.objectContaining({
          source_kind: "text-input",
          target_name: "Input",
        }),
        expect.objectContaining({
          source_kind: "navigation",
          target_name: "Link",
        }),
      ]),
      pattern_rewrites: expect.arrayContaining([
        expect.objectContaining({
          source_kind: "split-action",
          target_name: "Split button",
        }),
      ]),
      phases: expect.arrayContaining([
        expect.objectContaining({
          title: "Lock the translation map",
        }),
        expect.objectContaining({
          title: "Validate the migrated Salt UI",
        }),
      ]),
      starter_code_targets: expect.arrayContaining([
        expect.objectContaining({
          source_kind: "split-action",
          target_name: "Split button",
        }),
      ]),
    });
    expect(result.starter_code?.[0]).toMatchObject({
      label: "Split button starter",
      language: "tsx",
    });
    expect(result.combined_scaffold?.[0]).toMatchObject({
      label: "Translated Salt scaffold",
      language: "tsx",
    });
    expect(result.combined_scaffold?.[0]?.code).toContain(
      "export function TranslatedSaltScaffold()",
    );
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_examples",
        }),
      ]),
    );
    expect(
      result.suggested_follow_ups?.some((followUp: { reason: string }) =>
        followUp.reason.includes("project conventions"),
      ),
    ).toBe(true);
  });

  it("returns a normalized source model and explicit assumptions for description-led translation", () => {
    const result = migrateToSalt(REGISTRY, {
      query:
        "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
    });

    expect(result.source_profile).toMatchObject({
      code_provided: false,
      query_provided: true,
      ui_flavor: "description",
    });
    expect(result.source_ui_model).toMatchObject({
      summary: {
        translation_mode: "map-from-description",
        signal_sources: ["query"],
      },
      page_regions: expect.arrayContaining([
        expect.objectContaining({
          kind: "sidebar",
        }),
        expect.objectContaining({
          kind: "content",
        }),
        expect.objectContaining({
          kind: "toolbar",
        }),
      ]),
      states: expect.arrayContaining([
        expect.objectContaining({
          kind: "loading",
        }),
        expect.objectContaining({
          kind: "error",
        }),
      ]),
      groupings: expect.arrayContaining([
        expect.objectContaining({
          kind: "app-shell",
        }),
        expect.objectContaining({
          kind: "dialog-flow",
        }),
      ]),
      ui_regions: expect.arrayContaining([
        expect.objectContaining({
          kind: "vertical-navigation",
          scope: "app-structure",
        }),
        expect.objectContaining({
          kind: "dialog",
          scope: "flow",
        }),
      ]),
    });
    expect(result.implementation_plan.phases[0]).toMatchObject({
      title: "Lock the translation map",
      focus: expect.stringContaining("inferred UI regions"),
    });
    expect(result.implementation_plan.workstreams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "App shell",
        }),
        expect.objectContaining({
          label: "Dialog flow",
        }),
      ]),
    );
    expect(result.implementation_plan.scaffold_handoff).toMatchObject({
      build_around: expect.arrayContaining(["App shell"]),
    });
    expect(result.assumptions).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "inferred from the description or mockup language",
        ),
      ]),
    );
    expect(result.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "vertical-navigation",
          salt_target: expect.objectContaining({
            name: "VerticalNavigation",
          }),
          confidence_detail: expect.objectContaining({
            blocker: "project-conventions-dependency",
            next_question: expect.stringContaining(
              "approved shell or navigation wrapper",
            ),
          }),
        }),
      ]),
    );
  });

  it("surfaces clarifying questions for low-confidence translation paths", () => {
    const result = migrateToSalt(REGISTRY, {
      query: "Build a data grid with filters and validation states.",
      package: "@salt-ds/does-not-exist",
      view: "full",
    });

    expect(result.summary.manual_reviews).toBeGreaterThan(0);
    expect(result.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "data-table",
          confidence_detail: expect.objectContaining({
            blocker: "no-direct-salt-match",
            next_question: expect.stringContaining("dense data surface"),
          }),
        }),
      ]),
    );
    expect(result.clarifying_questions).toEqual(
      expect.arrayContaining([expect.stringContaining("dense data surface")]),
    );
    expect(result.decision_gates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "data-table",
          question: expect.stringContaining("dense data surface"),
        }),
      ]),
    );
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "create_salt_ui",
        }),
      ]),
    );
  });

  it("accepts a structured source outline for mockup-style translation", () => {
    const result = migrateToSalt(REGISTRY, {
      source_outline: {
        regions: ["header", "sidebar", "main content", "dialog footer"],
        actions: ["primary action with secondary menu", "navigation link"],
        states: ["loading", "validation"],
        notes: ["This screen has a confirmation dialog."],
      },
      include_starter_code: true,
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      scope: "official_salt_only",
      project_conventions: {
        supported: true,
        contract: "project_conventions_v1",
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers"]),
      },
    });
    expect(result.source_profile).toMatchObject({
      code_provided: false,
      query_provided: true,
      ui_flavor: "description",
    });
    expect(result.source_ui_model.page_regions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "header" }),
        expect.objectContaining({ kind: "sidebar" }),
        expect.objectContaining({ kind: "footer" }),
      ]),
    );
    expect(result.source_ui_model.states).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "loading" }),
        expect.objectContaining({ kind: "validation" }),
      ]),
    );
    expect(result.source_ui_model.ui_regions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "split-action" }),
        expect.objectContaining({ kind: "navigation" }),
        expect.objectContaining({ kind: "dialog" }),
      ]),
    );
    expect(result.combined_scaffold?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Built from the translated workstreams"),
      ]),
    );
    expect(result.next_step).toContain("project conventions");
  });

  it("routes adoption-style discovery queries to migrate_to_salt", () => {
    const result = discoverSalt(REGISTRY, {
      query: "convert a material ui screen to salt",
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        contract: "project_conventions_v1",
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers", "page-patterns"]),
      },
    });
    expect(result.decision).toMatchObject({
      workflow: "migrate_to_salt",
      args: {
        query: "convert a material ui screen to salt",
        include_starter_code: true,
        view: "full",
      },
    });
    expect(result.next_step).toContain(
      "Translate the source UI into Salt targets first",
    );
    expect(result.next_step).toContain("project conventions");
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "migrate_to_salt",
        }),
      ]),
    );
    expect(
      result.suggested_follow_ups?.some((followUp) =>
        followUp.reason.includes("project conventions"),
      ),
    ).toBe(true);
  });

  it("routes page-level mockup questions to migrate_to_salt with richer defaults", () => {
    const result = discoverSalt(REGISTRY, {
      query:
        "Design a dashboard page with a sidebar, header, toolbar, loading state, and dialog footer",
    });

    expect(result.decision).toMatchObject({
      workflow: "migrate_to_salt",
      args: expect.objectContaining({
        include_starter_code: true,
        view: "full",
      }),
    });
  });

  it("finds component capabilities from consumer terminology", () => {
    const capabilityRegistry: SaltRegistry = {
      ...REGISTRY,
      components: [
        ...REGISTRY.components,
        {
          id: "component.input",
          name: "Input",
          aliases: ["text field"],
          package: {
            name: "@salt-ds/core",
            status: "stable",
            since: "1.0.0",
          },
          summary: "Collects short text input.",
          status: "stable",
          category: ["inputs"],
          tags: ["form", "text"],
          when_to_use: ["Capture short-form text."],
          when_not_to_use: ["Use MultilineInput for longer content."],
          alternatives: [],
          props: [
            {
              name: "validationStatus",
              type: '"error" | "warning" | "success"',
              required: false,
              description: "Controls the validation styling for the field.",
              default: null,
              allowed_values: ["error", "warning", "success"],
              deprecated: false,
            },
            {
              name: "readOnly",
              type: "boolean",
              required: false,
              description:
                "Prevents editing while keeping the value focusable.",
              default: "false",
              deprecated: false,
            },
          ],
          accessibility: {
            summary: ["Associate the field with a visible label."],
            rules: [],
          },
          tokens: [],
          patterns: ["Forms"],
          examples: [
            {
              id: "input.validation",
              title: "Validation in form field",
              intent: ["form validation"],
              complexity: "intermediate",
              code: '<Input validationStatus="error" readOnly />',
              source_url: "/salt/components/input/examples",
              package: "@salt-ds/core",
              target_type: "component",
              target_name: "Input",
            },
          ],
          related_docs: {
            overview: "/salt/components/input",
            usage: "/salt/components/input/usage",
            accessibility: "/salt/components/input/accessibility",
            examples: "/salt/components/input/examples",
          },
          source: {
            repo_path: "packages/core/src/input",
            export_name: "Input",
          },
          deprecations: [],
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = searchComponentCapabilities(capabilityRegistry, {
      query: "validation read-only",
      top_k: 5,
    });

    expect(result.matches[0]).toMatchObject({
      component: {
        name: "Input",
      },
    });
    expect(result.matches[0]?.capabilities).toEqual(
      expect.arrayContaining(["read-only", "validation"]),
    );
  });

  it("compares package and component changes between versions", () => {
    const result = compareVersions(REGISTRY, {
      package: "@salt-ds/core",
      component_name: "Button",
      from_version: "1.9.0",
      to_version: "2.0.1",
      include_deprecations: true,
    });

    expect(result.summary).toBe(
      "Button has 0 breaking, 2 important, and 0 informational changes between 1.9.0 and 2.0.1.",
    );
    expect(result.important).toEqual(
      expect.arrayContaining([
        "2.0.1: Fixed Button keyboard active styling.",
        "2.0.0: variant is deprecated.",
      ]),
    );
    expect(result.next_step).toBe(
      'Replace variant="cta" with appearance="solid".',
    );
  });

  it("can return full version comparison metadata when requested", () => {
    const result = compareVersions(REGISTRY, {
      package: "@salt-ds/core",
      component_name: "Button",
      from_version: "1.9.0",
      to_version: "2.0.1",
      include_deprecations: true,
      view: "full",
    });

    expect(result.summary).toMatchObject({
      package: "@salt-ds/core",
      component: "Button",
      change_count: 2,
      deprecation_count: 1,
    });
    expect(result.changes).toHaveLength(2);
  });

  it("keeps deprecated changelog entries in important changes when no deprecation record mirrors them", () => {
    const result = compareVersions(
      {
        ...REGISTRY,
        deprecations: REGISTRY.deprecations.filter(
          (deprecation) => deprecation.name !== "variant",
        ),
      },
      {
        package: "@salt-ds/core",
        component_name: "Button",
        from_version: "1.9.0",
        to_version: "2.0.1",
        include_deprecations: true,
      },
    );

    expect(result.important).toEqual(
      expect.arrayContaining([
        "2.0.0: Deprecated Button variant prop in favor of appearance and sentiment.",
      ]),
    );
  });

  it("recommends matching tokens for styling intent", () => {
    const result = recommendTokens(REGISTRY, {
      query: "warning foreground",
      category: "color",
      top_k: 5,
    });

    expect(result.recommended).toMatchObject({
      name: "--salt-color-warning-foreground",
      category: "color",
    });
    expect(result.next_step).toBe(
      "Apply --salt-color-warning-foreground and verify it fits the relevant theme and density.",
    );
  });

  it("uses token policy metadata in recommendation rationale and next steps", () => {
    const tokenRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
        {
          name: "--salt-palette-accent-border",
          category: "palette",
          type: "color",
          value: "#1d4ed8",
          semantic_intent: null,
          themes: ["salt", "next"],
          densities: [],
          applies_to: [],
          guidance: ["Intermediate palette token."],
          aliases: [],
          policy: {
            usage_tier: "palette",
            direct_component_use: "never",
            preferred_for: [
              "internal theme and mode mapping inside the Salt token system",
            ],
            avoid_for: ["direct component styling"],
            notes: [
              "Palette tokens sit between foundations and characteristics and should not be referenced directly in components or patterns.",
            ],
            docs: ["/salt/themes/design-tokens/index"],
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = recommendTokens(tokenRegistry, {
      query: "palette accent border",
      top_k: 1,
    });

    expect(result.recommended).toMatchObject({
      name: "--salt-palette-accent-border",
      why: "Palette tokens sit between foundations and characteristics and should not be referenced directly in components or patterns.",
      policy: {
        usage_tier: "palette",
        direct_component_use: "never",
      },
    });
    expect(result.next_step).toBe(
      "Do not apply --salt-palette-accent-border directly in component code; choose a semantic characteristic token instead.",
    );
  });

  it("routes broad queries to the best consumer starting point", () => {
    const result = discoverSalt(REGISTRY, {
      query: "how should I handle typography hierarchy",
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        check_recommended: false,
        topics: [],
      },
    });
    expect(result.best_start).toMatchObject({
      workflow: "get_salt_entity",
    });
    expect(result.options?.foundations[0]).toMatchObject({
      title: "Typography",
    });
    expect(result.next_step).toBe(
      "Apply the typography guidance to the current layout or component.",
    );
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "get_salt_entity",
        }),
      ]),
    );
  });

  it("surfaces top-level guidance_sources in discovery routing", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "Link"
          ? {
              ...component,
              semantics: {
                category: ["navigation"],
                preferred_for: ["Navigate to another route."],
                not_for: ["Use Button for actions."],
                derived_from: [
                  "component-category-map",
                  "usage-docs",
                  "usage-callouts",
                ],
              },
            }
          : component,
      ),
    };

    const result = discoverSalt(registry, {
      query: "navigate to another route",
    });

    expect(result.guidance_sources).toEqual([
      "component-category-map",
      "usage-docs",
      "usage-callouts",
    ]);
  });

  it("returns clarifying questions for broad consumer intent", () => {
    const result = discoverSalt(REGISTRY, {
      query: "select an option",
    });

    expect(result.clarifying_questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "selection-mode",
        }),
      ]),
    );
  });

  it("can infer starter-code intent through discover_salt", () => {
    const result = discoverSalt(REGISTRY, {
      query: "starter code for navigate to another route",
    });

    expect(result.best_start).toMatchObject({
      workflow: "create_salt_ui",
    });
    expect(result.related_guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    );
    expect(result.starter_code?.[0]?.code).toContain(
      'import { Link } from "@salt-ds/core";',
    );
  });

  it("routes structured navigation shell queries to pattern-first discovery", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.vertical-navigation",
          name: "Vertical navigation",
          aliases: [
            "vertical-navigation",
            "sidebar navigation",
            "navigation pane",
            "left-hand navigation",
            "nested navigation",
          ],
          summary:
            "Vertical navigation provides users with a structured and intuitive way to navigate pages, sections, and application hierarchy from a dedicated pane.",
          status: "stable",
          category: ["layout-and-shells", "navigation-and-wayfinding"],
          when_to_use: [
            "Use for app-level vertical navigation or structured sidebar navigation.",
            "Use when nested sections or grouped navigation need to remain visible inside a dedicated pane.",
          ],
          when_not_to_use: ["Use Link for a single destination."],
          composed_of: [{ component: "Navigation item", role: null }],
          related_patterns: ["Navigation"],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            semantics: {
              regions: [
                "navigation-pane",
                "nested-navigation",
                "content-context",
              ],
              build_around: [
                "Fixed or responsive navigation pane",
                "Stacked navigation item hierarchy inside the pane",
                "Main content area that stays distinct from the navigation tree",
              ],
              preserve_constraints: [
                "Keep navigation items grouped inside a dedicated pane rather than scattering links through the page body.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "BorderLayout", package: "@salt-ds/core" },
                { name: "NavigationItem", package: "@salt-ds/core" },
                { name: "StackLayout", package: "@salt-ds/core" },
              ],
              jsx_lines: [
                "<BorderLayout>",
                "  <aside>{/* Navigation pane: fixed or responsive depending on the app shell */}",
                '    <nav aria-label="Primary">',
                "      <StackLayout>",
                '        <NavigationItem href="/overview">Overview</NavigationItem>',
                "        <NavigationItem>{/* Parent section that reveals nested items */}</NavigationItem>",
                "      </StackLayout>",
                "    </nav>",
                "  </aside>",
                "  <main>",
                "    <StackLayout>{/* Main content area stays distinct from the navigation tree */}</StackLayout>",
                "  </main>",
                "</BorderLayout>",
              ],
              notes: [
                "Start from the pane and navigation hierarchy rather than reducing the pattern to loose links or an unrelated page list.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/vertical-navigation" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const result = discoverSalt(registry, {
      query: "sidebar navigation with nested sections",
    });

    expect(result.best_start).toMatchObject({
      workflow: "create_salt_ui",
      args: {
        solution_type: "pattern",
        query: "sidebar navigation with nested sections",
      },
      result: expect.objectContaining({
        name: "Vertical navigation",
      }),
    });
    expect(result.options?.patterns[0]).toMatchObject({
      name: "Vertical navigation",
    });
  });

  it("returns full-fidelity foundation data in discover_salt raw output", () => {
    const result = discoverSalt(REGISTRY, {
      query: "Typography",
      view: "full",
    });

    expect(result.raw).toMatchObject({
      foundation_lookup: {
        foundation: {
          title: "Typography",
          route: "/salt/foundations/typography",
          page_kind: "foundation",
        },
      },
    });
    expect(result.options?.foundations[0]).toMatchObject({
      title: "Typography",
      docs: ["/salt/foundations/typography"],
    });
    expect(result.options?.foundations[0]).not.toHaveProperty("route");
  });

  it("includes routing provenance in full discover_salt output", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "Link"
          ? {
              ...component,
              semantics: {
                category: ["navigation"],
                preferred_for: ["Navigate to another route."],
                not_for: ["Use Button for actions."],
                derived_from: ["component-category-map", "usage-docs"],
              },
            }
          : component,
      ),
    };

    const result = discoverSalt(registry, {
      query: "navigate to another route",
      view: "full",
    });

    expect(result.raw).toMatchObject({
      routing_debug: {
        chosen_workflow: "create_salt_ui",
        top_component_guidance_sources: [
          "component-category-map",
          "usage-docs",
        ],
      },
    });
  });

  it("returns related entities for a component", () => {
    const result = getRelatedEntities(REGISTRY, {
      target_type: "component",
      name: "Button",
      max_results: 10,
    });

    expect(result.target).toMatchObject({
      name: "Button",
    });
    expect(result.related.patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Split button",
        }),
      ]),
    );
    expect(result.related.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "--salt-size-base",
        }),
      ]),
    );
    expect(result.related.guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Developing with Salt",
        }),
      ]),
    );
  });

  it("does not let alias ambiguity override an exact pattern name match", () => {
    const ambiguousPatternRegistry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          ...REGISTRY.patterns[0],
          id: "pattern.split-button-alias-one",
          name: "Button split alternatives",
          aliases: ["split-button"],
          related_docs: {
            overview: "/salt/patterns/button-split-alternatives",
          },
        },
        {
          ...REGISTRY.patterns[0],
          id: "pattern.split-button-alias-two",
          name: "Split button menu",
          aliases: ["split-button"],
          related_docs: {
            overview: "/salt/patterns/split-button-menu",
          },
        },
      ],
    };

    const result = getPattern(ambiguousPatternRegistry, {
      name: "Split button",
    });

    expect(result.pattern).toMatchObject({
      name: "Split button",
    });
    expect(result.ambiguity).toBeUndefined();
  });

  it("uses generic foundation follow-ups instead of page-header-specific ones", () => {
    const result = getFoundation(REGISTRY, {
      name: "Typography",
    });

    expect(
      result.suggested_follow_ups
        ?.filter((followUp) => followUp.workflow === "discover_salt")
        .map((followUp) => followUp.args),
    ).toEqual([
      {
        query: "Typography",
      },
      {
        query: "Typography for a component or layout",
      },
    ]);
  });

  it("returns deeper related entities for a page", () => {
    const pageRegistry: SaltRegistry = {
      ...REGISTRY,
      pages: [
        ...REGISTRY.pages,
        {
          id: "page.button.overview",
          title: "Button",
          route: "/salt/components/button",
          page_kind: "component-doc",
          summary: "Button overview guidance.",
          keywords: ["Button", "action"],
          content: ["Use Button to trigger actions."],
          section_headings: ["Usage", "Examples"],
          last_verified_at: TIMESTAMP,
        },
        {
          id: "page.button.usage",
          title: "Button Usage",
          route: "/salt/components/button/usage",
          page_kind: "component-doc",
          summary: "Button usage guidance.",
          keywords: ["Button", "usage"],
          content: ["Use Button for direct actions."],
          section_headings: ["Best practices"],
          last_verified_at: TIMESTAMP,
        },
        {
          id: "page.split-button.overview",
          title: "Split button",
          route: "/salt/patterns/split-button",
          page_kind: "pattern-doc",
          summary: "Split button pattern guidance.",
          keywords: ["Split button", "Button"],
          content: ["Combine Button with Menu."],
          section_headings: ["How it works"],
          last_verified_at: TIMESTAMP,
        },
        {
          id: "page.guide.developing",
          title: "Developing with Salt",
          route: "/salt/getting-started/developing",
          page_kind: "guide",
          summary: "Getting started with Salt.",
          keywords: ["setup", "Button"],
          content: ["Start with SaltProvider and Button."],
          section_headings: ["Install core packages"],
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    const result = getRelatedEntities(pageRegistry, {
      target_type: "page",
      name: "/salt/components/button",
      max_results: 10,
    });

    expect(result.target).toMatchObject({
      title: "Button",
    });
    expect(result.related.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Button",
        }),
      ]),
    );
    expect(result.related.patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Split button",
        }),
      ]),
    );
    expect(result.related.guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Developing with Salt",
        }),
      ]),
    );
    expect(result.related.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          route: "/salt/components/button/usage",
        }),
      ]),
    );
  });

  it("uses the same normalized guide lookup in related-entity exploration", () => {
    const result = getRelatedEntities(REGISTRY, {
      target_type: "guide",
      name: "getting-started",
      max_results: 10,
    });

    expect(result.target).toMatchObject({
      name: "Developing with Salt",
    });
    expect(result.related.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Button",
        }),
      ]),
    );
  });
});

describe("curated public tools", () => {
  it("chooses a workflow-oriented Salt solution", () => {
    const result = createSaltUi(REGISTRY, {
      query: "navigate to another route",
      include_starter_code: true,
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      scope: "official_salt_only",
      project_conventions: {
        contract: "project_conventions_v1",
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers"]),
      },
    });
    expect(result.mode).toBe("recommend");
    expect(result.solution_type).toBe("component");
    expect(result.decision).toMatchObject({
      name: "Link",
    });
    expect(result.related_guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    );
    expect(result.starter_code?.[0]).toMatchObject({
      label: "Link starter",
    });
  });

  it("surfaces top-level guidance_sources for the winning recommendation", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "Link"
          ? {
              ...component,
              semantics: {
                category: ["navigation"],
                preferred_for: ["Navigate to another route."],
                not_for: ["Use Button for actions."],
                derived_from: [
                  "component-category-map",
                  "usage-docs",
                  "usage-callouts",
                ],
              },
            }
          : component,
      ),
    };

    const result = createSaltUi(registry, {
      query: "navigate to another route",
    });

    expect(result.guidance_sources).toEqual([
      "component-category-map",
      "usage-docs",
      "usage-callouts",
    ]);
  });

  it("includes decision provenance in full create_salt_ui output", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.map((component) =>
        component.name === "Link"
          ? {
              ...component,
              semantics: {
                category: ["navigation"],
                preferred_for: ["Navigate to another route."],
                not_for: ["Use Button for actions."],
                derived_from: ["component-category-map", "usage-docs"],
              },
            }
          : component,
      ),
    };

    const result = createSaltUi(registry, {
      query: "navigate to another route",
      view: "full",
    });

    expect(result.raw).toMatchObject({
      decision_debug: {
        selected_name: "Link",
        selected_guidance_sources: ["component-category-map", "usage-docs"],
        selected_categories: ["navigation"],
      },
    });
  });

  it("can merge a real create_salt_ui result with project conventions through the runtime package", () => {
    const canonical = createSaltUi(REGISTRY, {
      query: "navigate to another route",
    });

    const merged = mergeCanonicalAndProjectConventionLayers(
      {
        decision: canonical.decision,
        guidance_boundary: canonical.guidance_boundary,
        related_guides: canonical.related_guides?.map((guide) =>
          guide.overview
            ? {
                name: guide.name,
                overview: guide.overview,
              }
            : {
                name: guide.name,
              },
        ),
      },
      [
        {
          id: "team-checkout",
          scope: "team",
          source: "./team.json",
          conventions: {
            preferred_components: [
              {
                salt_name: "Link",
                prefer: "AppLink",
                reason:
                  "The repo wraps navigation links for analytics and route helpers.",
              },
            ],
          },
        },
      ],
    );

    expect(merged).toMatchObject({
      canonical_choice: {
        name: "Link",
        source: "canonical_salt",
      },
      project_conventions: {
        consulted: true,
        check_recommended: true,
        applied: true,
        topics: expect.arrayContaining(["wrappers"]),
        applied_rule: {
          type: "preferred-component",
          replacement: "AppLink",
        },
      },
      final_choice: {
        name: "AppLink",
        source: "project_conventions",
        based_on: "Link",
      },
    });
  });

  it("prefers patterns for structured navigation shell queries", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.vertical-navigation",
          name: "Vertical navigation",
          aliases: [
            "vertical-navigation",
            "sidebar navigation",
            "navigation pane",
            "left-hand navigation",
            "nested navigation",
          ],
          summary:
            "Vertical navigation provides users with a structured and intuitive way to navigate pages, sections, and application hierarchy from a dedicated pane.",
          status: "stable",
          category: ["layout-and-shells", "navigation-and-wayfinding"],
          when_to_use: [
            "Use for app-level vertical navigation or structured sidebar navigation.",
            "Use when nested sections or grouped navigation need to remain visible inside a dedicated pane.",
          ],
          when_not_to_use: ["Use Link for a single destination."],
          composed_of: [{ component: "Navigation item", role: null }],
          related_patterns: ["Navigation"],
          how_to_build: [],
          how_it_works: [],
          accessibility: { summary: [] },
          resources: [],
          examples: [],
          starter_scaffold: {
            semantics: {
              regions: [
                "navigation-pane",
                "nested-navigation",
                "content-context",
              ],
              build_around: [
                "Fixed or responsive navigation pane",
                "Stacked navigation item hierarchy inside the pane",
                "Main content area that stays distinct from the navigation tree",
              ],
              preserve_constraints: [
                "Keep navigation items grouped inside a dedicated pane rather than scattering links through the page body.",
              ],
            },
            template: {
              kind: "fallback-template",
              imports: [
                { name: "BorderLayout", package: "@salt-ds/core" },
                { name: "NavigationItem", package: "@salt-ds/core" },
                { name: "StackLayout", package: "@salt-ds/core" },
              ],
              jsx_lines: [
                "<BorderLayout>",
                "  <aside>{/* Navigation pane: fixed or responsive depending on the app shell */}",
                '    <nav aria-label="Primary">',
                "      <StackLayout>",
                '        <NavigationItem href="/overview">Overview</NavigationItem>',
                "        <NavigationItem>{/* Parent section that reveals nested items */}</NavigationItem>",
                "      </StackLayout>",
                "    </nav>",
                "  </aside>",
                "  <main>",
                "    <StackLayout>{/* Main content area stays distinct from the navigation tree */}</StackLayout>",
                "  </main>",
                "</BorderLayout>",
              ],
              notes: [
                "Start from the pane and navigation hierarchy rather than reducing the pattern to loose links or an unrelated page list.",
              ],
            },
          },
          related_docs: { overview: "/salt/patterns/vertical-navigation" },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const result = createSaltUi(registry, {
      query: "sidebar navigation with nested sections",
      include_starter_code: true,
    });

    expect(result.solution_type).toBe("pattern");
    expect(result.decision).toMatchObject({
      name: "Vertical navigation",
    });
    expect(result.starter_code?.[0]?.code).toContain("<NavigationItem");
    expect(result.starter_code?.[0]?.code).toContain(
      '<nav aria-label="Primary">',
    );
    expect(result.starter_code?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Fixed or responsive navigation pane"),
      ]),
    );
  });

  it("biases pattern recommendations toward derived pattern categories when categories are provided", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        {
          id: "pattern.command-header",
          name: "Command header",
          aliases: ["/salt/patterns/command-header"],
          summary: "A primary action with fallback options in a related menu.",
          status: "stable",
          category: ["layout-and-shells"],
          when_to_use: [
            "One action is most likely, with secondary actions still available.",
          ],
          when_not_to_use: [],
          composed_of: [{ component: "Button", role: "primary action" }],
          related_patterns: [],
          how_to_build: [
            "Use a primary button for the dominant action.",
            "Pair it with a menu trigger for secondary actions.",
          ],
          how_it_works: [
            "The primary trigger executes immediately.",
            "The menu trigger exposes related fallback actions.",
          ],
          accessibility: {
            summary: [
              "Ensure keyboard access to both triggers and menu items.",
            ],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/command-header",
          },
          last_verified_at: TIMESTAMP,
        },
        ...REGISTRY.patterns,
      ],
    };

    const result = createSaltUi(registry, {
      query: "primary action with fallback options in a related menu",
      solution_type: "pattern",
      preferred_categories: ["actions-and-commands"],
    });

    expect(result.decision).toMatchObject({
      name: "Split button",
    });
  });

  it("treats names as an explicit comparison request", () => {
    const result = createSaltUi(REGISTRY, {
      query: "navigate to another route",
      names: ["Button"],
    });

    expect(result.mode).toBe("compare");
    expect(result.decision.name).toBeNull();
    expect(result.next_step).toContain(
      "Provide at least two exact component names to compare, or start from create_salt_ui.",
    );
    expect(result.next_step).toContain("project conventions");
  });

  it("resolves canonical Salt entities through a single lookup tool", () => {
    const result = getSaltEntity(REGISTRY, {
      name: "Button",
      include_related: true,
      include_starter_code: true,
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers"]),
      },
    });
    expect(result.entity_type).toBe("component");
    expect(result.decision.status).toBe("found");
    expect(result.entity).toMatchObject({
      name: "Button",
    });
    expect(result.related?.patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Split button",
        }),
      ]),
    );
    expect(result.starter_code?.[0]).toMatchObject({
      label: "Button starter",
    });
  });

  it("returns curated Salt examples with optional starter code", () => {
    const result = getSaltExamples(REGISTRY, {
      target_type: "component",
      target_name: "Button",
      include_starter_code: true,
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers"]),
      },
    });
    expect(result.decision).toMatchObject({
      target_name: "Button",
      target_type: "component",
    });
    expect(result.best_example).toMatchObject({
      title: "Primary form submit",
    });
    expect(result.starter_code?.[0]).toMatchObject({
      label: "Button starter",
    });
  });

  it("supports history-style version analysis through upgrade_salt_ui", () => {
    const result = upgradeSaltUi(REGISTRY, {
      package: "@salt-ds/core",
      from_version: "1.1.0",
      include_deprecations: true,
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        check_recommended: true,
        topics: expect.arrayContaining(["migration-shims"]),
      },
    });
    expect(result.mode).toBe("history");
    expect(result.decision).toMatchObject({
      target: "@salt-ds/core",
      to_version: "2.0.0",
    });
    expect(result.notes?.[0]).toContain("to_version was not provided");
  });
});
