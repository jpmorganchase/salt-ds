import { describe, expect, it } from "vitest";
import {
  chooseSaltSolution,
  compareOptions,
  compareSaltVersions,
  compareVersions,
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
  recommendComponent,
  recommendTokens,
  searchApiSurface,
  searchComponentCapabilities,
  searchSaltDocs,
} from "../tools/index.js";
import { isComponentAllowedByDocsPolicy } from "../tools/utils.js";
import type { SaltRegistry } from "../types.js";

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
          tool: "get_salt_examples",
        }),
        expect.objectContaining({
          tool: "choose_salt_solution",
        }),
      ]),
    );
    expect(result.suggested_follow_ups).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "get_salt_entity",
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
          tool: "get_salt_examples",
        }),
        expect.objectContaining({
          tool: "choose_salt_solution",
        }),
      ]),
    );
    expect(result.suggested_follow_ups).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "get_salt_entity",
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
          tool: "discover_salt",
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
          tool: "get_salt_entity",
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
      why: "Navigate to another route.",
    });
    expect(result.alternatives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Button",
        }),
      ]),
    );
    expect(result.recommended).toMatchObject({
      ship_check: {
        stable_for_production: true,
        accessibility_guidance: true,
      },
      caveats: [],
    });
    expect(result.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "get_salt_examples",
        }),
        expect.objectContaining({
          tool: "choose_salt_solution",
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
    expect(result.starter_code?.[0]?.code).toContain("import { Button, Menu }");
    expect(result.starter_code?.[1]).toMatchObject({
      label: "Basic split button example",
    });
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
          tool: "get_salt_examples",
        }),
        expect.objectContaining({
          tool: "get_salt_entity",
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
      "Retry with exact component names or start from choose_salt_solution.",
    );
  });

  it("requires at least two names for a real comparison", () => {
    const result = compareOptions(REGISTRY, {
      option_type: "component",
      names: ["Button"],
    });

    expect(result.compared).toEqual([]);
    expect(result.next_step).toBe(
      "Provide at least two exact component names to compare, or start from choose_salt_solution.",
    );
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

  it("routes broad queries to the best consumer starting point", () => {
    const result = discoverSalt(REGISTRY, {
      query: "how should I handle typography hierarchy",
    });

    expect(result.best_start).toMatchObject({
      tool: "get_salt_entity",
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
          tool: "get_salt_entity",
        }),
      ]),
    );
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
      tool: "choose_salt_solution",
    });
    expect(result.starter_code?.[0]?.code).toContain(
      'import { Link } from "@salt-ds/core";',
    );
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
        ?.filter((followUp) => followUp.tool === "discover_salt")
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
    const result = chooseSaltSolution(REGISTRY, {
      query: "navigate to another route",
      include_starter_code: true,
    });

    expect(result.mode).toBe("recommend");
    expect(result.solution_type).toBe("component");
    expect(result.decision).toMatchObject({
      name: "Link",
    });
    expect(result.starter_code?.[0]).toMatchObject({
      label: "Link starter",
    });
  });

  it("treats names as an explicit comparison request", () => {
    const result = chooseSaltSolution(REGISTRY, {
      query: "navigate to another route",
      names: ["Button"],
    });

    expect(result.mode).toBe("compare");
    expect(result.decision.name).toBeNull();
    expect(result.next_step).toBe(
      "Provide at least two exact component names to compare, or start from choose_salt_solution.",
    );
  });

  it("resolves canonical Salt entities through a single lookup tool", () => {
    const result = getSaltEntity(REGISTRY, {
      name: "Button",
      include_related: true,
      include_starter_code: true,
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

  it("supports history-style version analysis through compare_salt_versions", () => {
    const result = compareSaltVersions(REGISTRY, {
      package: "@salt-ds/core",
      from_version: "1.1.0",
    });

    expect(result.mode).toBe("history");
    expect(result.decision).toMatchObject({
      target: "@salt-ds/core",
      to_version: "2.0.0",
    });
    expect(result.notes?.[0]).toContain("to_version was not provided");
  });
});
