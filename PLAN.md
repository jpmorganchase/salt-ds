# Salt Design System — AI Starter Kit Plan

## Goals

The starter kit serves two purposes:

1. **AI reference** — Teams point their copilot at this repo (or copy its instruction files into their own project) so the AI generates correct Salt Design System code. The kit uses a **layered context model** designed around how GitHub Copilot actually consumes information: global guardrails in Copilot instructions, path-specific coding rules, structured component facts in JSON, human-authored usage guidance in Markdown, lightweight bridge files for fast context, and task-specific prompt files that pull everything together.
2. **Clonable prototype environment** — Teams clone this repo and run `npm install && npm run setup` to get a working React app pre-configured with Salt, ready for building prototypes. The setup script prompts teams to confirm their brand (defaulting to `jpm-brand`) and configures the correct provider, CSS imports, and fonts automatically. After setup, `npm run dev` starts the dev server.

The kit should be as simple as possible — bare minimum dependencies, no tooling opinions beyond what's needed to render and preview components.

---

## Context Architecture

The kit follows a **layered context model** optimised for how GitHub Copilot discovers and consumes information. Rather than one giant file, context is separated by type and purpose:

| Layer | Location | Purpose | Copilot mechanism |
|---|---|---|---|
| **Global guardrails** | `.github/copilot-instructions.md` | Stable, project-wide rules | Repository-wide custom instructions (auto-loaded) |
| **Path-specific rules** | `.github/instructions/*.instructions.md` | Design-system coding rules scoped to relevant paths | Path-specific instructions |
| **Component facts (JSON)** | `design-system/components/<name>/<name>.json` | Machine-readable API truth | File context (referenced by prompt files and bridge files) |
| **Usage guidance (Markdown)** | `design-system/components/<name>/<name>.md` | Human judgment, UX rationale | File context (referenced by prompt files and bridge files) |
| **Bridge files** | `design-system/components/<name>/<name>.context.md` | Lightweight entry point (10–20 lines) linking JSON + MD | Quick context without parsing large files |
| **Task prompts** | `.github/prompts/*.prompt.md` | Reusable, task-specific instructions that reference the right files | Prompt files for targeted generation |

**Why this separation works:**

- **Signal quality** — GitHub's guidance is to give Copilot the right context and avoid irrelevant context. Too much mixed information makes responses less consistent. ([GitHub Docs](https://docs.github.com/en/copilot))
- **Copilot's own mechanisms** — Repository instructions are for broad project rules, path-specific instructions help avoid overloading global context, and prompt files are better for task-specific generation. ([Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context))
- **Extremes don't work** — All-in-one documents are too noisy; pure JSON lacks judgment; pure guidelines lack structure.

**Simple rule of thumb:**

- Put **facts** in JSON
- Put **decisions and nuance** in Markdown
- Put **task framing** in prompt files
- Put **global guardrails** in Copilot instructions

---

## Proposed Structure

```
salt-ai-starter-kit/
│
├── .github/
│   ├── copilot-instructions.md                     # Global guardrails (auto-loaded by GitHub Copilot)
│   ├── instructions/
│   │   ├── design-system.instructions.md            # DS coding rules (path-scoped to design-system/ and src/)
│   │   ├── salt-setup.instructions.md               # Provider, theme CSS, fonts, brand selection
│   │   ├── salt-theming.instructions.md             # Modes, density, tokens, CSS variables
│   │   └── salt-layout.instructions.md              # Layout & spacing using Salt foundations
│   └── prompts/
│       ├── get-started.prompt.md                   # Entry point: set up for either goal
│       ├── build-form.prompt.md                     # Task: build a Salt form
│       ├── build-data-grid.prompt.md                # Task: build a data grid
│       ├── new-component-usage.prompt.md            # Task: use a Salt component correctly
│       ├── accessibility-audit.prompt.md            # Task: WCAG 2.2 compliance check
│       └── responsive-layout.prompt.md              # Task: build a responsive layout
│
├── design-system/
│   ├── components/                                  # One folder per component
│   │   ├── button/
│   │   │   ├── button.json                          # Machine-readable API facts
│   │   │   ├── button.md                            # Usage guidance & UX rationale
│   │   │   └── button.context.md                    # Bridge file (lightweight entry point)
│   │   ├── card/
│   │   │   ├── card.json
│   │   │   ├── card.md
│   │   │   └── card.context.md
│   │   ├── input/
│   │   │   ├── input.json
│   │   │   ├── input.md
│   │   │   └── input.context.md
│   │   └── ...                                      # One folder per component or component group
│   │
│   ├── patterns/                                    # One folder per pattern
│   │   ├── form/
│   │   │   ├── form.json                            # Pattern recipe (required components, layout)
│   │   │   ├── form.md                              # Pattern guidance (variants, validation, do's/don'ts)
│   │   │   └── form.context.md                      # Bridge file
│   │   ├── app-header/
│   │   │   ├── app-header.json
│   │   │   ├── app-header.md
│   │   │   └── app-header.context.md
│   │   ├── button-bar/
│   │   │   ├── button-bar.json
│   │   │   ├── button-bar.md
│   │   │   └── button-bar.context.md
│   │   └── ...
│   │
│   └── foundations/                                 # Design tokens & scales
│       ├── spacing/
│       │   ├── spacing.json                         # Spacing scale values, gap mappings
│       │   └── spacing.md                           # When/how to use spacing, gap vs margin
│       ├── color/
│       │   ├── color-tokens.json                    # Semantic token names by characteristic
│       │   └── color.md                             # Semantic color usage, characteristic mapping
│       ├── typography/
│       │   ├── typography.json                      # Font families, sizes, weights, line-heights
│       │   └── typography.md                        # Text hierarchy, font usage rules
│       ├── tokens/
│       │   ├── token-overview.md                    # Three-tier architecture: foundation → palette → characteristic
│       │   ├── characteristic-tokens.md             # When to use actionable, navigable, status, etc.
│       │   └── custom-css.md                        # Writing custom CSS with Salt tokens
│       ├── density.md                               # Density selection guidance & impact
│       ├── modes.md                                 # Light/dark mode implementation rules
│       └── iconography.md                           # Icon sizing, usage, accessibility
│
├── src/
│   ├── main.tsx                                     # Entry point — SaltProvider pre-configured
│   ├── App.tsx                                      # Starter app with example Salt components
│   └── App.css                                      # Minimal custom styles (near-empty)
│
├── public/
│   └── fonts/                                       # Self-hosted fonts (Amplitude for jpm-brand)
│       └── ...                                      # @font-face files placed here during setup
│
├── salt.config.json                                 # Brand configuration (generated by setup script)
├── setup.mjs                                        # Interactive setup script — prompts for brand
├── index.html                                       # HTML shell with required web fonts
├── package.json                                     # Salt + Vite + React (minimal deps)
├── tsconfig.json                                    # TypeScript config
├── vite.config.ts                                   # Vite dev server config
└── README.md                                        # Quick start & how to point your own project here
```

---

## File-by-File Plan

### 1. `.github/copilot-instructions.md` — Global Guardrails

Auto-loaded by GitHub Copilot whenever the repo is open. Contains **only stable, project-wide rules** — kept deliberately slim to avoid overloading global context:

- Always use Salt Design System components from `@salt-ds/core` over raw HTML elements (e.g., `<Button>` not `<button>`, `<Text>` not `<p>`).
- Do not create custom components if a Salt equivalent exists.
- Follow component APIs exactly — consult the JSON definitions in `design-system/components/`.
- Follow usage guidance in `design-system/components/` before selecting variants, sentiments, or appearances.
- Never hard-code colors, spacing, or typography — use Salt CSS tokens (`--salt-*`).
- Never invent tokens — only use tokens defined in `design-system/foundations/`.
- Use Salt layout components (StackLayout, FlowLayout, etc.) instead of manual CSS for layout.
- Prefer documented composition patterns from `design-system/patterns/`.
- Ensure WCAG 2.2 compliant interactions.
- Use `@salt-ds/core` for stable, production-ready components. **Never use `@salt-ds/lab` components unless they are labeled as "RC" (Release Candidate) on saltdesignsystem.com.** Alpha/experimental lab components are unstable and may be removed.
- When performing a specific task (e.g., building a form), check `.github/prompts/` for a matching prompt file.
- Read `salt.config.json` to determine the active brand. Use the corresponding provider and CSS imports as defined in `.github/instructions/salt-setup.instructions.md`.

This file does **not** contain component APIs, usage guidance, or setup details — those live in their dedicated layers.

### 2. `.github/instructions/` — Path-Specific Instruction Files

Path-specific instructions that Copilot applies only when working in relevant directories. This avoids overloading global context with rules that only matter in certain paths.

#### 2a. `.github/instructions/design-system.instructions.md`

Design-system-specific coding rules, scoped to component and application code via `applyTo` frontmatter:

```yaml
---
applyTo: "design-system/**,src/**"
---
```

Contains:

- Import pattern: `import { ComponentName } from "@salt-ds/core"`.
- Prop conventions (e.g., `sentiment`, `appearance`, `variant`).
- Icon usage: import from `@salt-ds/icons`.
- **Lab component policy:** Never import from `@salt-ds/lab` unless the component is marked as "RC" (Release Candidate) on the [saltdesignsystem.com components page](https://www.saltdesignsystem.com/salt/components/index). When an RC lab component is used, add a code comment noting its RC status.
- Do's and don'ts (e.g., don't apply custom className for things Salt tokens already handle, don't override Salt styles with custom CSS, don't nest interactive components).
- When implementing a component, always read its bridge file (`<name>.context.md`) first for quick guidance, then consult the JSON and MD files if more detail is needed.
- Always wrap the application root in the correct provider for the configured brand (references `salt-setup.instructions.md` for details).

#### 2b. `.github/instructions/salt-setup.instructions.md`

Detailed setup rules, scoped to configuration and entry-point files:

```yaml
---
applyTo: "src/main.tsx,index.html,salt.config.json,setup.mjs"
---
```

Covers:

- **Brand selection** — During setup, teams select a brand alias that configures the entire environment. Each alias maps to a specific provider, CSS imports, and font requirements:
  - **`jpm-brand`** (recommended for all new projects):
    - Provider: `<SaltProviderNext accent="teal" corner="rounded" headingFont="Amplitude" actionFont="Amplitude">`
    - CSS imports: `@salt-ds/theme/index.css` **and** `@salt-ds/theme/css/theme-next.css`
    - Fonts: Open Sans, PT Mono (via Google Fonts), **plus Amplitude** (self-hosted — download from [internal fonts resource](https://go/salt-ds-internal/resources/index)). Amplitude `@font-face` declarations required for weights 300, 400, 500, 700.
  - **`legacy`** (UITK migration):
    - Provider: `<SaltProvider>`
    - CSS imports: `@salt-ds/theme/index.css`
    - Fonts: Open Sans and PT Mono (via Google Fonts)
  - **`chase`** (CCB) — Coming next quarter. Configuration will be added once available.
  - **`jpmc`** (Parent brand) — Coming next quarter. Configuration will be added once available.
- See [Salt Themes documentation](https://www.saltdesignsystem.com/salt/themes/index) for the latest theme details.
- The chosen provider must wrap the entire app at the root level.
- How to nest the provider for scoped theme/mode/density overrides (use sparingly).

#### 2c. `.github/instructions/salt-theming.instructions.md`

Theming and tokens, scoped to application and style files:

```yaml
---
applyTo: "src/**,design-system/**"
---
```

Covers:

- **Brand → provider mapping** — Refer to `salt-setup.instructions.md` for the canonical mapping of brands to providers, CSS imports, and fonts. Do not duplicate that mapping here.
- When generating code, always use the provider and CSS imports matching the project's configured brand (read from `salt.config.json`). Do not mix providers.
- Light/dark mode: set via `mode` prop on the provider (`"light"` | `"dark"`).
- Density: set via `density` prop (`"high"` | `"medium"` | `"low"` | `"touch"`). Default is `"medium"`.
- CSS custom properties: use `--salt-*` tokens for color, spacing, typography in custom CSS.
- Characteristic tokens (e.g., `--salt-actionable-*`, `--salt-navigable-*`, `--salt-status-*`).
- Never override Salt token values unless intentionally theming.
- Reference: [Salt Themes documentation](https://www.saltdesignsystem.com/salt/themes/index).

#### 2d. `.github/instructions/salt-layout.instructions.md`

Layout guidance, scoped to application code:

```yaml
---
applyTo: "src/**"
---
```

Covers:

- Always prefer Salt layout components over manual CSS flexbox/grid:
  - `StackLayout` — vertical stack with consistent gap.
  - `FlowLayout` — horizontal wrapping flow.
  - `FlexLayout` — flexible row/column layout.
  - `GridLayout` — CSS grid-based layout.
  - `BorderLayout` — header/footer/left/right/center regions.
  - `SplitLayout` — splits children into start and end groups.
- Spacing: use the `gap` prop (number maps to Salt spacing scale) rather than custom margin/padding.
- Responsive patterns: use Salt's breakpoint system via `useCurrentBreakpoint` hook.

### 3. `design-system/components/` — Component Facts, Guidance & Bridge Files

Each component gets its own folder containing three files that serve distinct purposes. This is the core of the layered context model.

#### 3a. `<name>.json` — Machine-Readable Component Facts

Structured data that gives Copilot precise, parseable knowledge. These are **not human documentation** — they are optimised for AI consumption. Each file contains:

- Component name and package (`@salt-ds/core` or `@salt-ds/lab`).
- Import statement.
- Full prop interface with types, defaults, and descriptions.
- Available `sentiment`, `appearance`, and `variant` values where applicable.
- Slot/children expectations.
- States (default, hover, focus, active, disabled, etc.).
- Design tokens used by the component.
- Accessibility requirements that are deterministic (role, keyboard interactions, required ARIA attributes).
- Status: `stable`, `RC`, or `alpha` (mirrors saltdesignsystem.com).
- Link to the live documentation page.
- Dependency and composition info (e.g., Input requires FormField).

Example (`button/button.json`):
```json
{
  "name": "Button",
  "description": "Triggers an action or event",
  "package": "@salt-ds/core",
  "import": "import { Button } from \"@salt-ds/core\";",
  "status": "stable",
  "props": {
    "sentiment": {
      "type": "'accented' | 'positive' | 'negative' | 'caution'",
      "default": "'accented'"
    },
    "appearance": {
      "type": "'solid' | 'bordered' | 'transparent'",
      "default": "'solid'"
    },
    "disabled": {
      "type": "boolean",
      "default": "false"
    }
  },
  "states": ["default", "hover", "focus", "active", "disabled"],
  "tokens": {
    "background": "--salt-actionable-primary-background",
    "text": "--salt-actionable-primary-foreground",
    "padding": "--salt-spacing-200"
  },
  "accessibility": {
    "role": "button",
    "keyboard": ["Enter", "Space"],
    "aria": ["aria-disabled (if disabled)", "aria-label (if icon-only)"]
  },
  "docsUrl": "https://www.saltdesignsystem.com/salt/components/button/examples"
}
```

**Copilot uses this for precision** — APIs, tokens, valid variants, accessibility requirements.

#### 3b. `<name>.md` — Usage Guidance & UX Rationale

Human-authored Markdown covering **judgment and decisions** — the things that require UX understanding, not just API knowledge. Each file covers:

- **When to use** this component (and when not to — e.g., use `Button` not `<a>` for actions, use `InteractableCard` not `Button` for selectable surfaces).
- **When not to use** — alternatives and why.
- **Variant/sentiment/appearance selection** — which to use in which context (e.g., primary action → `accented` + `solid`, destructive action → `negative`).
- **Content guidance** — labelling rules, tone, length.
- **Layout and composition rules** — how the component fits with others (e.g., `Input` should always be inside `FormField`, only one primary button per container).
- **Common mistakes** — pitfalls the AI should avoid (e.g., multiple primary buttons, using tertiary for destructive actions, overriding Salt styles with custom CSS).
- **Accessibility intent** — where judgment is needed (e.g., label must clearly describe the action, icon-only buttons must include an accessible name).
- **Migration notes** — if applicable, how to migrate from older components or patterns.

Example (`button/button.md`):
```md
# Button

## When to use
- Trigger a clear, immediate action (e.g. Submit, Save, Continue)
- Use as the primary action within a container or page section

## When not to use
- Navigation between pages → use Link
- Toggle state → use Toggle or Switch

## Variants
- **Primary (accented + solid)**: Main action per screen
- **Secondary (accented + bordered)**: Supporting actions
- **Tertiary (accented + transparent)**: Low emphasis or inline actions

## Content guidance
- Use short, verb-led labels ("Save", "Continue")
- Avoid vague labels ("Click here")

## Layout rules
- Only one primary button per container
- Group multiple buttons horizontally, primary first

## Common mistakes
- Multiple primary buttons competing for attention
- Using tertiary for destructive actions
- Overriding button styles with custom CSS

## Accessibility intent
- Label must clearly describe the action
- Icon-only buttons must include an accessible name
```

**Copilot uses this for judgment** — UX decisions, design rationale, composition rules.

#### 3c. `<name>.context.md` — Lightweight Bridge File

A 10–20 line summary that gives Copilot a **fast entry point** without needing to parse two larger files. Each bridge file contains:

- What the component is for (one line).
- Where the JSON lives (relative path).
- Where the guidelines live (relative path).
- The 3–5 most important guardrails.
- A minimal usage example.

Example (`button/button.context.md`):
```md
# Button (Copilot Context)

Use for triggering actions.

- API: ./button.json
- Guidance: ./button.md

## Key rules
- Use `accented` + `solid` for main action only (one per container)
- Never use for navigation — use Link instead
- Always include accessible label (especially icon-only)
- Use `negative` sentiment for destructive actions

## Example
\`\`\`tsx
import { Button } from "@salt-ds/core";
<Button sentiment="accented" appearance="solid">Save</Button>
\`\`\`
```

**This prevents Copilot from needing to parse two large files every time.**

#### Planned starter components

Each getting a full `json` + `md` + `context.md` set:
- `button`, `card`, `input`, `text`, `panel`, `status-indicator`, `form-field`, `dialog`, `tooltip`, `tabs`, `navigation-item`, `overlay` — plus additional folders as coverage expands.

### 4. `design-system/patterns/` — Pattern Facts, Guidance & Bridge Files

Same three-file structure as components, applied to Salt patterns.

#### `<name>.json` — Pattern recipe:
- Pattern name and description.
- Required components and their roles within the pattern.
- Recommended layout structure (which layout components to use and how to nest them).
- Example code snippet.
- Link to the live pattern page on saltdesignsystem.com.

#### `<name>.md` — Pattern guidance:
- **What the pattern solves** — the UX problem it addresses.
- **Required components** and their roles within the pattern.
- **Layout structure** — which layout components to use, nesting order, and gap/alignment values.
- **Variants** — different configurations for different use cases.
- **Validation and state management** — how to handle form validation, error states, loading states.
- **Do's and don'ts** — correct vs. incorrect implementations with rationale.
- **Example code** — a complete, copy-pasteable implementation.

#### `<name>.context.md` — Lightweight bridge (same format as components).

Planned starter patterns:
- `form`, `app-header`, `button-bar`, `list-builder` — expanding as Salt publishes new patterns.

### 5. `design-system/foundations/` — Foundation Tokens, Scales & Guidance

Foundation knowledge split into JSON (structured data) and Markdown (usage guidance) within topic folders.

**`spacing/`**
- `spacing.json` — Salt spacing scale values and how they map to the `gap` prop.
- `spacing.md` — When to use the spacing scale vs. custom values. How `gap` prop values map to the scale. When to use margin vs. padding vs. layout gap.

**`color/`**
- `color-tokens.json` — Semantic color token names grouped by characteristic (actionable, status, navigable, etc.).
- `color.md` — Semantic color usage: never use raw color values, always use characteristic tokens. How to map UI intent to the correct characteristic.

**`typography/`**
- `typography.json` — Font families, size scale, weight tokens, and line-height tokens.
- `typography.md` — Text hierarchy rules: when to use `<Text>`, `<Display>`, `<H1>`–`<H4>`. Font weight semantics.

**`tokens/`** — How the token system works:
- `token-overview.md` — Salt's three-tier token architecture: foundation tokens → palette tokens → characteristic tokens. Why to consume characteristic tokens.
- `characteristic-tokens.md` — Detailed guidance on each characteristic group (`--salt-actionable-*`, `--salt-navigable-*`, `--salt-status-*`, `--salt-selectable-*`, `--salt-editable-*`, `--salt-container-*`, `--salt-content-*`, `--salt-overlayable-*`).
- `custom-css.md` — Rules for writing custom CSS within a Salt application.

**Standalone guidance files:**
- `density.md` — How to choose density based on use case. Impact on sizing, spacing, touch targets.
- `modes.md` — Light/dark mode implementation. Common pitfalls.
- `iconography.md` — Icon sizing conventions, when to use with/without labels, accessibility.

Additional JSON files as needed (e.g., `breakpoints.json`, `shadows.json`, `corner-radius.json`).

### 6. `.github/prompts/` — Task-Specific Prompt Files

Reusable prompt files that **pull the layers together** for specific tasks. This is where JSON facts, Markdown guidance, and task framing converge. Each prompt file:

- States the goal clearly.
- Lists requirements and constraints.
- References the relevant context files using `@` notation.
- Provides task-specific instructions.

Prompt files replace the old `.instructions/skills/` concept — they serve the same purpose but use Copilot's native prompt file mechanism, which is designed for exactly this.

#### Planned prompt files:

**`get-started.prompt.md`** — The single entry-point prompt. When a user runs this, it asks which goal they want to achieve and walks them through setup:

```md
# Get Started with the Salt AI Starter Kit

This kit supports two modes. Which do you need?

## Option 1: Prototype environment
Clone this repo and build a working Salt app.

### Steps
1. Run `npm install`
2. Run `npm run setup` — select your brand (default: jpm-brand)
3. Run `npm run dev` to start the dev server
4. Edit `src/App.tsx` to start building

### Context
@salt.config.json
@.github/instructions/salt-setup.instructions.md
@design-system/components/button/button.context.md

### Notes
- The app ships pre-configured for jpm-brand — run `npm run setup` to change
- For jpm-brand: download Amplitude fonts into `public/fonts/`
- Use Salt components from `@salt-ds/core` — see `design-system/components/` for APIs and guidance
- Use `.github/prompts/` for task-specific help (e.g., build-form, accessibility-audit)

## Option 2: AI reference for an existing project
Copy the AI context files into your own repo so Copilot generates correct Salt code.

### Steps
1. Copy `.github/copilot-instructions.md` into your repo's `.github/` folder
2. Copy `.github/instructions/` into your repo's `.github/instructions/` folder
3. Copy `design-system/` into your repo root
4. Copy any `.github/prompts/` files you want to use
5. Copy `salt.config.json` into your repo root and set the correct brand
6. Adjust `applyTo` glob patterns in instruction files if your source paths differ from `src/`

### Context
@.github/copilot-instructions.md
@salt.config.json

### Notes
- No npm dependencies required — these are context files only
- The `design-system/` folder must be at the repo root for relative paths in bridge files to work
- If your project uses a different source directory, update `applyTo` patterns in `.github/instructions/`
```

This prompt serves as the front door to the kit. Users trigger it once, pick their path, and get guided through setup. Copilot has the right context files referenced for either path.

**`build-form.prompt.md`** — How to build a Salt form:
```md
# Build a form using Salt components

## Requirements
- Use design system components only
- Follow component usage guidance
- Include accessible labels and keyboard support

## Context
@design-system/components/form-field/form-field.context.md
@design-system/components/input/input.context.md
@design-system/components/button/button.context.md
@design-system/patterns/form/form.context.md

## Task
- Use FormField, Input, FormFieldLabel, FormFieldHelperText
- Layout with StackLayout
- Follow the Salt Forms pattern
- Include validation states
- Primary submit button, secondary cancel button
```

**`build-data-grid.prompt.md`** — How to build a data grid with Salt's `AgGridTheme` or compose a table from Salt primitives.

**`new-component-usage.prompt.md`** — How to correctly use any Salt component (references the component's bridge file dynamically).

**`accessibility-audit.prompt.md`** — WCAG 2.2 AA rules applied to Salt: ARIA attributes, keyboard navigation, focus management, color contrast via Salt tokens.

**`responsive-layout.prompt.md`** — How to build responsive layouts using Salt's breakpoint system, `useCurrentBreakpoint`, and responsive layout components.

Teams are encouraged to add their own prompt files for domain-specific tasks (e.g., `build-dashboard.prompt.md`, `build-trade-blotter.prompt.md`).

### 7. `index.html`

Minimal HTML shell:

- Standard Vite HTML boilerplate.
- Google Fonts `<link>` tags for Open Sans and PT Mono (required by all brands).
- **If `jpm-brand` is configured:** also includes self-hosted Amplitude font files in `public/fonts/` and `@font-face` declarations (weights 300, 400, 500, 700) in the app CSS. Amplitude is not available via Google Fonts — it must be downloaded from the [internal fonts resource](https://go/salt-ds-internal/resources/index).
- Single `<div id="root">` mount point.

### 8. `package.json`

Only the dependencies needed to run the prototype:

**Dependencies:**
- `react`
- `react-dom`
- `@salt-ds/core`
- `@salt-ds/theme`
- `@salt-ds/icons`
- `@salt-ds/lab`

**Dev dependencies:**
- `vite`
- `@vitejs/plugin-react`
- `typescript`
- `@types/react`
- `@types/react-dom`

**Scripts:**
- `setup` — `node setup.mjs` (interactive brand selection and configuration)
- `dev` — `vite` (start dev server)
- `build` — `vite build`
- `preview` — `vite preview`

No linting, testing, formatting, or CI tooling.

### 9. `vite.config.ts`

Minimal Vite config:

- Import and use `@vitejs/plugin-react`.
- No additional plugins or custom configuration.

### 10. `tsconfig.json`

Standard React TypeScript config:

- `jsx: "react-jsx"`
- `strict: true`
- Target modern browsers.

### 11. `salt.config.json` — Brand Configuration

**Ships pre-committed** with `jpm-brand` as the default:

```json
{
  "brand": "jpm-brand"
}
```

Valid values: `"jpm-brand"`, `"legacy"`, `"chase"` (coming soon), `"jpmc"` (coming soon).

This means the repo works immediately after `git clone && npm install && npm run dev` — both `salt.config.json` and `src/main.tsx` ship configured for `jpm-brand`, so Copilot can always read the active brand and the app always renders correctly, even if the user skips `npm run setup`.

`npm run setup` overwrites this file if the user selects a different brand. The file is committed to the repo so all team members and AI assistants share the same brand context.

### 12. `setup.mjs` — Interactive Setup Script

A zero-dependency Node.js script that runs via `npm run setup`. It:

1. **Prompts the user to confirm or select a brand.** Uses Node's built-in `readline` — no dependencies required. The prompt defaults to `jpm-brand`:
   ```
   Which Salt brand do you want to use?
     1. jpm-brand (recommended) ← default
     2. legacy
     3. chase (coming soon)
     4. jpmc (coming soon)
   Press Enter for jpm-brand, or type a number:
   ```
   If the user presses Enter without typing anything, `jpm-brand` is selected.

2. **Writes `salt.config.json`** with the selected brand.

3. **Generates `src/main.tsx`** with the correct provider, CSS imports, and brand comment based on the selection:
   - **`jpm-brand`** →
     ```tsx
     // Brand: jpm-brand
     import "@salt-ds/theme/index.css";
     import "@salt-ds/theme/css/theme-next.css";
     import { SaltProviderNext } from "@salt-ds/core";

     <SaltProviderNext accent="teal" corner="rounded" headingFont="Amplitude" actionFont="Amplitude">
       <App />
     </SaltProviderNext>
     ```
   - **`legacy`** →
     ```tsx
     // Brand: legacy
     import "@salt-ds/theme/index.css";
     import { SaltProvider } from "@salt-ds/core";

     <SaltProvider>
       <App />
     </SaltProvider>
     ```

4. **Updates `index.html`** — adds Amplitude `@font-face` references for `jpm-brand`, or removes them for `legacy`.

5. **Prints next steps:**
   ```
   ✓ Configured for jpm-brand
     Run: npm run dev
   ```
   For `jpm-brand`, also prints a reminder to download Amplitude fonts into `public/fonts/`.

The script is idempotent — running it again re-prompts and overwrites the configuration safely.

### 13. `src/main.tsx`

Application entry point, **generated by `setup.mjs`** based on the selected brand (see section 12). Ships with `jpm-brand` as the default.

- Renders to `#root`.
- A code comment at the top of the file identifies which brand is active.

### 14. `src/App.tsx`

Minimal example app demonstrating correct Salt usage:

- A few Salt components (Button, Text, Card, StackLayout) used correctly.
- Shows proper import patterns.
- Simple enough to be replaced entirely with prototype code.

### 15. `src/App.css`

Near-empty file. Exists as a place for teams to add custom styles, with a comment reminding them to use Salt tokens.

### 16. `README.md`

Three sections:

- **Setup & Brand Selection** — How to clone and configure the kit:
  1. `git clone`, `npm install`.
  2. `npm run setup` — the script prompts for brand selection (defaults to `jpm-brand`).
  3. `npm run dev` to start the dev server.
  - For `jpm-brand`: reminder to download Amplitude fonts into `public/fonts/` from the [internal fonts resource](https://go/salt-ds-internal/resources/index).
  - To reconfigure later, run `npm run setup` again.
  - Links to [Salt Themes documentation](https://www.saltdesignsystem.com/salt/themes/index) for full details.
- **Clone & Prototype** — Edit `src/App.tsx` to start building. Notes which brand is configured (read from `salt.config.json`).
- **Use as AI Reference** — How to copy `.github/` and `design-system/` into your own project so your copilot follows Salt conventions. Alternatively, how to add this repo as a git submodule or reference.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Vite** over CRA, Next.js, Remix | Lightest bundler. No routing, SSR, or framework opinions. Fast HMR. Single config file. |
| **No testing/linting/CI** | Bare minimum principle. Teams add their own tooling in their projects. |
| **Layered context model** | Separating facts (JSON), judgment (Markdown), task framing (prompt files), and guardrails (instructions) produces the best Copilot output quality. All-in-one documents are too noisy; pure JSON lacks judgment; pure guidelines lack structure. This follows GitHub's guidance on signal quality and avoiding irrelevant context. |
| **JSON for component facts** | Structured JSON files give Copilot precise, parseable component APIs, tokens, and accessibility rules. Copilot doesn't hallucinate props or tokens when the source is structured data. Files can be auto-generated from Salt's source in future. |
| **Markdown for usage guidance** | Human-authored guidance covers judgment calls — when to use, UX rationale, common mistakes, accessibility intent. This is the "design intelligence" layer that prevents technically correct but design-system-wrong output. |
| **Bridge files (`.context.md`)** | Lightweight 10–20 line summaries give Copilot a fast entry point per component without parsing two larger files. Links to both the JSON and markdown for deeper context. Improves response time and consistency. |
| **Path-specific instructions** | `.github/instructions/` files apply only when working in relevant paths, avoiding overloading global context. This is the mechanism Copilot provides for scoped rules ([GitHub Docs](https://docs.github.com/en/copilot)). |
| **Prompt files over skill files** | `.github/prompts/` replaces the earlier `.instructions/skills/` approach. Prompt files are Copilot's native mechanism for reusable, task-specific instructions and can reference other files directly using `@` notation ([Microsoft Learn](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context)). |
| **Slim global instructions** | `.github/copilot-instructions.md` contains only stable, project-wide rules — no component details, no setup specifics. This follows GitHub's guidance to keep repository-wide instructions focused and free of irrelevant context. |
| **`design-system/` over hidden folders** | Using `design-system/` instead of `.context/` and `.knowledge/` makes the content visible, navigable, and easier for teams to contribute to. The folder structure mirrors how teams think about components and patterns. |
| **No component wrappers** | The kit doesn't re-export or abstract Salt. It teaches the AI to use Salt directly. |
| **Google Fonts over Fontsource** | Zero npm packages for fonts. One `<link>` tag in HTML. Simplest option. `jpm-brand` additionally requires self-hosted Amplitude font (not available on Google Fonts). |
| **Interactive setup with default brand** | `npm run setup` prompts teams to confirm or change the brand, defaulting to `jpm-brand`. This avoids silent misconfiguration while keeping the happy path fast (press Enter). The script generates `salt.config.json`, `src/main.tsx`, and updates `index.html` — teams never need to understand provider internals. See [Salt Themes](https://www.saltdesignsystem.com/salt/themes/index). |
| **`salt.config.json` for brand state** | A committed config file makes the selected brand visible to the team and to AI assistants. Copilot can read it to determine which provider and CSS imports to use. The setup script is the only writer. |
| **TypeScript included** | Salt is built in TypeScript and its types improve AI code generation accuracy. Minimal overhead. |
| **`@salt-ds/lab` included** | Teams may need RC (Release Candidate) lab components in prototypes. **Only lab components labeled as "RC" on saltdesignsystem.com may be used in prototypes and builds.** Alpha/experimental lab components must never be used — they are unstable and may be removed. Instruction files enforce this policy. See the Salt operational model for details. |

---

## How the Layers Work Together

A practical example of how Copilot uses each layer when asked to "add a submit button to this form":

1. **Global guardrails** (`.github/copilot-instructions.md`) — Copilot knows to use Salt's `Button`, not raw `<button>`.
2. **Path-specific rules** (`.github/instructions/design-system.instructions.md`) — Copilot knows to check the bridge file first.
3. **Bridge file** (`design-system/components/button/button.context.md`) — Copilot quickly learns: use `accented` + `solid` for main action, include accessible label, never use for navigation.
4. **JSON facts** (`design-system/components/button/button.json`) — Copilot gets the exact import, prop types, valid sentiments, and ARIA requirements.
5. **Usage guidance** (`design-system/components/button/button.md`) — Copilot confirms: only one primary button per container, use verb-led label.
6. **Prompt file** (`.github/prompts/build-form.prompt.md`) — If the user triggered this prompt, all relevant context files are already referenced.

**Result:** Copilot generates `<Button sentiment="accented" appearance="solid" type="submit">Submit</Button>` with correct import, correct variant for a form's primary action, and proper accessibility — without hallucinated props or design-system-wrong choices.

---

## What's Intentionally Excluded

- Routing (react-router, etc.)
- State management (redux, zustand, etc.)
- API/data fetching setup
- ESLint, Prettier, Biome
- Unit/E2E testing
- CI/CD configuration
- Storybook
- Docker / containerization
- Any component wrappers or abstractions over Salt

---

## Next Steps

Once this plan is approved, I will create all files in the repository.
