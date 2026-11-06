# RFC 003: Theme appearance and application runtime integration

| Item                 | Value                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status               | Draft for team discussion; proposals are not approved release commitments                                                                                                                                             |
| Date                 | November 6, 2026                                                                                                                                                                                                      |
| Source baseline      | [`3bd9580d2a09e9bc0415efd30469f211256fe08f`](https://github.com/jpmorganchase/salt-ds/tree/3bd9580d2a09e9bc0415efd30469f211256fe08f)                                                                                  |
| Decision requested   | Approve additive system appearance, an explicit application ownership contract, and focused compatibility fixes while retaining the current styling defaults                                                          |
| First implementation | Add system appearance to the providers; establish a separate two-remote runtime fixture and ownership guide                                                                                                           |
| Related RFCs         | [Component contracts and React](./001-component-contracts-and-react.md), [Native form integration](./002-native-form-integration.md), [Guidance and maintainer workflows](./004-guidance-and-maintainer-workflows.md) |

## Summary

Salt should support applications that follow the user's system appearance, preserve reliable light and dark regions, and behave predictably when several application modules share a page. These improvements can use Salt's existing tokens, providers, plain CSS, and style injection.

The immediate theme change is `mode="system"` on `SaltProvider` and `SaltProviderNext`. This is a preference accepted by the provider. The resolved value exposed by `useTheme().mode` and written to `data-mode` remains `"light" | "dark"`. Existing applications continue to default to light mode.

The runtime recommendation assumes the deployment discussed with application teams: predominantly single-page applications, with microfrontends using one tested combination of Salt and theme versions. Under that constraint, share the relevant runtime modules, let the shell own document-level appearance and theme CSS, and give independently mounted React roots explicit scoped providers. Fix demonstrated problems with ownership, identifiers, scroll locking, and style placement in small changes.

Keep plain CSS and current style injection as the default. CSS Modules deserve a bounded evaluation for private implementation selectors, but a catalog-wide conversion is not required for these improvements. React 19 stylesheet resources and adaptive token output also remain separate experiments with measurable entry criteria. None of them automatically solves the ownership of theme tokens, React context, or document effects.

## Decisions proposed

| ID  | Proposed decision                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | Accept `mode="system"` at the provider boundary while preserving resolved mode types, defaults, explicit overrides, and nested inheritance.                                                |
| T2  | Make initial HTML appearance an application-shell integration contract, delivered after the provider change. Salt does not own preference persistence.                                     |
| T3  | Preserve the current browser and React floors. Introduce newer CSS through tested, optional capabilities and useful fallbacks.                                                             |
| T4  | Recommend one tested Salt/theme combination and shared runtime modules for applications sharing a document. Independently mounted roots receive their own explicitly configured providers. |
| T5  | Use a two-remote fixture to reproduce runtime defects, then address each defect independently. Source-level concerns are not presented as completed browser findings.                      |
| T6  | Retain plain CSS and current injection defaults. Evaluate private CSS Modules, React 19 resources, or adaptive tokens only against a concrete unmet requirement.                           |

Approving this RFC approves those directions and bounded implementation slices. It does not approve a new styling engine, guarantee arbitrary version coexistence, or finalize speculative public APIs.

## Scope and compatibility baseline

This RFC covers appearance selection, theme boundaries, initial-document integration, component CSS ownership, shared runtime behavior, and evidence needed for modern CSS options. It excludes the separate build-tooling discussion and makes no changes to the design language, token names, approved theme policy, or React/browser support floors.

The pinned [supported-platforms page][platforms] specifies Chrome 86+, Firefox 86+, Edge 85+, Safari 15.4+, and React 16.14+. Those are the baseline for compatible releases. A particular MFE estate can require React 19 without changing Salt's general minimum. Running a current WebKit test does not establish compatibility with Safari 15.4.

CSS inheritance, React context, and document-global effects need separate treatment. A DOM subtree can inherit CSS variables without inheriting React context. A portal preserves its originating React context while moving its DOM elsewhere. Neither establishes ownership of document-global scroll locking. The proposal makes each boundary explicit. [React context][react-context] and [portal documentation][react-portals] describe the first two behaviors.

## Current implementation and evidence

These findings come from reading the pinned source. Their likely consequences guide regression cases; this RFC does not claim that the proposed fixture or experiments have already run.

| Area                 | Verified implementation                                                                                                                                                                                                                                             | Consequence to investigate or preserve                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mode                 | `Mode` contains light and dark. `InternalSaltProvider` inherits the parent's resolved mode and defaults to light. [Mode][mode-source], [provider][provider]                                                                                                         | Add a provider preference without widening every consumer's resolved mode type.                                                                                   |
| Browser color scheme | Theme CSS already sets `color-scheme: light` or `dark` on matching theme boundaries. The theme entry imports that global CSS. [Global CSS][global-css], [entry][theme-entry]                                                                                        | Modernization should improve when the correct boundary appears, rather than duplicate an existing capability.                                                     |
| Root ownership       | `ThemeApplicator` claims a document through `Symbol.for("salt-provider")`, warns on a competing root provider, and changes root classes/data attributes in an effect. A rejected owner does not subscribe to a later release of the claim. [Applicator][applicator] | Keep one document owner; inspect cleanup and remount behavior. Automatic takeover is not an established contract.                                                 |
| Portals              | The default floating component adds a scoped provider inside its portal. [Floating implementation][floating]                                                                                                                                                        | Preserve the origin's resolved theme in dialogs, menus, and tooltips, including mode changes while open.                                                          |
| CSS injection        | The stylesheet cache is a module-local `WeakMap` keyed first by window, then CSS text and nonce. `insertionPoint` affects insertion and the effect dependencies but is absent from the cache key. [Injector][injector]                                              | Separate copies have separate caches. Identical CSS requested at different insertion points can reuse the first placement. Reproduce both cases.                  |
| Scroll locking       | The active count and restore function are module-local. The implementation deliberately targets ambient `window`/`document`; its comment explains the existing desktop behavior. [Scroll lock][scroll-lock]                                                         | Independently loaded copies can restore shared document styles out of order. Window-targeting changes need an explicit desktop decision.                          |
| IDs                  | `useId` uses React's API when available. `useIdMemo` always uses a module-local counter and is used by `TreeNode`. [ID helper][ids], [tree][tree-node]                                                                                                              | A React 19 deployment does not by itself remove the counter path or prevent collisions between separate copies.                                                   |
| Breakpoints          | An omitted provider `breakpoints` prop selects the defaults, rather than its parent's configured breakpoints. Matching uses ambient `window`. [Provider][provider], [matching][breakpoints]                                                                         | Nested providers, including popup scopes, need coverage for inherited configuration and target windows.                                                           |
| Theme compatibility  | Core and theme are separate packages; core does not declare a theme peer dependency. [Core manifest][core-package], [theme manifest][theme-package]                                                                                                                 | Record the tested combination and required theme assets. Matching core versions alone cannot establish token compatibility.                                       |
| Selector names       | Components use ordinary prefixed class names and component custom properties; `Button` is one example. [Button][button], [button CSS][button-css]                                                                                                                   | Namespacing reduces accidental collisions but does not isolate two releases that emit the same selector. Inventory supported customization hooks before renaming. |

The current [style-injection guide][style-guide] already offers runtime injection, CSP nonces, and static CSS with `enableStyleInjection={false}`. Preserve those paths and their responsibilities.

## System appearance

### Preference and resolved mode

The proposed provider input is a separate preference type equivalent to `Mode | "system"`. Its exported type name is an implementation detail to settle in the first PR. Existing `Mode`, `ModeValues`, `ThemeContextProps.mode`, and component decisions based on light/dark remain resolved values.

| Provider configuration                               | Proposed result                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Root with no `mode`                                  | Light, preserving today's default.                                         |
| Nested provider with no `mode`                       | Inherit the parent's resolved mode and subsequent changes.                 |
| Explicit `mode="light"` or `mode="dark"`             | Use that value regardless of the operating-system preference.              |
| Explicit `mode="system"`                             | Resolve the preference in the provider's target window and follow changes. |
| Explicit nested `mode="system"` under a fixed parent | Follow the target window's system preference for that region.              |
| No usable target window or media-query API           | Use a deterministic light fallback for the explicit system preference.     |

An illustrative usage, after the proposed addition, is:

```tsx
<SaltProvider mode="system">
  <Application />
  <SaltProvider mode="light">
    <FixedLightPreview />
  </SaltProvider>
</SaltProvider>
```

This does not broaden Salt's design recommendation for mixed modes. Existing guidance permits deliberate regions and cautions against switching modes component by component. Preserve that distinction. [Mode guidance][mode-guide]

### Subscription and lifecycle

Use the window selected by `WindowProvider`, not an unconditional global `window`. Subscribe to `(prefers-color-scheme: dark)` only where needed. Explicit light/dark providers and providers inheriting a resolved mode do not each need an independent listener.

Reevaluate when the target window or requested preference changes. Remove listeners on unmount, replacement, and transitions from system to a fixed preference. Support the media-query listener APIs required by the existing browser floor. Strict Mode setup/cleanup must not leave a second listener or stale state.

An appearance change updates the theme boundary and context together. It must not remount the application, close a popup, clear a form, or move focus. Existing density, theme-next settings, custom theme names, and `applyClassesTo` behavior remain intact.

### SSR and hydration

The server cannot generally know the user's media-query result. PR1 uses a deterministic server snapshot and matching initial hydration snapshot for system mode, then resolves the browser preference. Existing explicit light/dark rendering remains deterministic. No server import may access an unavailable browser global.

The root applicator currently writes document attributes in an effect. Therefore `mode="system"` alone cannot promise a correct first paint before JavaScript, even though it improves subsequent behavior. That limitation is explicit; the document integration described next addresses it separately.

Applications own saved preferences, cookies, local storage, account settings, and cross-tab synchronization. Salt accepts their chosen preference without selecting a storage key or imposing persistence policy.

## Initial document and modern CSS

### Application-shell integration

PR2 should provide complete recipes for a client-rendered application and an SSR application. Each recipe must establish:

1. Which layer owns the initial root theme class, density, resolved mode, and approved theme assets, including what a mounted provider may adopt and restore on cleanup.
2. How the initial `color-scheme` signal reaches the HTML before hydration, with a value that matches the application's real supported appearance.
3. How stored user choice, system preference, and the server's available information determine the initial state.
4. How bootstrap state and React's first snapshot agree, including a policy for mode-dependent markup.
5. What happens when storage is unavailable, a bootstrap script is blocked, or JavaScript has not loaded.

Do not publish a generic no-flash promise based only on adding a meta tag. A page that signals dark support but still paints fixed light tokens can produce inconsistent native controls and backgrounds. The first-paint recipe needs a tested state handoff, including any initial-snapshot API proposed later. The provider feature does not depend on finalizing that API.

WebKit's November 3, 2026 announcement describes Adaptive Dark Mode in Safari 27.3 beta. It recommends declaring authored color-scheme support early; it also states that the `only` keyword was not supported in beta 1 and that script-visible computed colors remain the authored colors when adaptation occurs. Treat that browser behavior as version-specific evidence, not a new Salt minimum or a universally reliable opt-out. [WebKit announcement][webkit-adaptive]

### Keep browser appearance and application surfaces aligned

The theme owns authored token values and component styling. Applications still choose page and content surface backgrounds. A theme provider should not begin painting every application background as an incidental part of adding system mode.

The document recipe must demonstrate intentional surface background/foreground token pairs, native form controls, scrollbars, nested regions, portals, icons, and at least one chart or canvas integration. Native browser UI responds to color-scheme separately from arbitrary authored colors. [CSS color adjustment][color-adjust]

Keep forced-colors accessibility separate from light/dark appearance. An application choosing dark mode must not disable a user's forced-colors palette. Tests should cover focus indicators, disabled controls, selection, validation, and meaningful chart colors, rather than treating a screenshot of a neutral card as sufficient evidence.

### Compatibility audit before new token syntax

Start by auditing shipped theme and component CSS against the documented browser floor. Confirm actual rendered colors and interaction states in a standalone fixture using the intended package assets. Test injection and static CSS in separate pages so one route cannot supply missing styles to the other.

For newer syntax, keep working declarations outside a feature query and apply enhancements only where supported. Validate the resulting styles, not just whether a parser accepts a function. A custom property containing an unsupported color function is not made safe merely by supplying a fallback argument to a later `var()` call; the consuming declaration still needs a valid supported value. [CSS custom properties][css-variables]

Preserve approved token values and names unless a separately reviewed design decision changes them. Replacing explicit palette values with generated mixes or automatic contrast choices can change visual semantics and contrast. CSS modernization is not approval for a token redesign.

### Bounded adaptive-token experiment

If the initial improvements leave a concrete problem, prototype `light-dark()` for a small representative token group. The function follows the used color scheme; it is not itself an application preference store. [CSS Color 5 draft][light-dark]

The experiment must compare the existing output and candidate output for explicit modes, system preference, nested opposite-mode regions, approved theme variants, custom-property overrides, portals, and fallback browsers. Check inherited aliases at the region where they are consumed, rather than assuming a root-level definition automatically resolves every nested boundary as intended.

Adopt only if it improves a demonstrated outcome such as first-paint behavior or maintenance of mode mappings without changing supported customization or adding an unacceptable compatibility burden. No output format or new public theme entry point is committed here. `color-mix()`, relative colors, `contrast-color()`, and cascade layers are separate decisions, each with its own use case and fallback; they are not prerequisites for system mode.

A modern-only theme bundle, OKLCH palette refinements, runtime color derivation, and broad `@property` registration remain deferred. Each needs a separate compatibility and design case; this RFC does not schedule them as follow-on deliverables.

## Application and MFE ownership

### Recommended supported configuration

The first runtime target is one tested Salt/theme combination within a document. The shell owns the document's theme assets and root attributes. It loads the required base and approved theme layers once, in the documented order, and supplies consistent density and appearance preferences.

Share React, React DOM, and the Salt modules carrying context or document-level runtime state. In the current implementation this includes core, styles, and window; audit other participating Salt packages and providers when the application composes them. Identical version strings do not imply a single module instance. React requires the provider and consumer to reference the same context object. [React context][react-context]

There are two distinct application structures:

| Structure                                    | Provider contract                                                                                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remotes render within the shell's React tree | With shared module identities, they can consume the shell's providers. Add nested scopes only when the remote needs a deliberate override.                                                                                                                          |
| Remotes create independent React roots       | Each root receives explicit providers and values from the shell. Use a scoped `SaltProvider` for the remote, and provide CSP, window, or floating-platform configuration where required. DOM nesting does not make React context cross independent root boundaries. |

A remote must not default to another root provider that competes to mutate `document.documentElement`. Prefer `applyClassesTo="scope"`, or `"child"` when the remote controls one suitable host element and preserves its existing props. The shell's documented interface carries preferences between independent roots; this RFC does not add a Salt-wide application state store.

For modern React roots, assign distinct `identifierPrefix` values, keeping server and hydration values consistent. This helps IDs generated by React's `useId`; it does not repair Salt's separate counter-based path. [React root options][react-roots], [hydration options][react-hydration]

### Styles and tokens

Keep runtime component-style injection enabled for the default SPA setup. Sharing the relevant runtime reduces duplicate caches and allows existing reference counts to coordinate component instances. Static component CSS remains the existing alternative for applications that need it; all relevant roots must agree on injection ownership, and the shell must load CSS for every participating package.

Neither disabling injection nor importing a shared stylesheet establishes React context sharing. Neither using React 19 nor choosing a CSS filename establishes token compatibility. Record the tested core, theme, and extension-package versions, including required theme layers, as application integration data.

A theme scope controls inherited variables and appearance. It does not prevent an ordinary global selector in one release from matching another release's DOM. Consequently, arbitrary Salt versions sharing a document are outside the initial guarantee, even if each remote has its own provider.

### Support boundaries

| Configuration                                                                      | Proposed treatment                                                                                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SPA, one root, shared Salt runtime and tested theme                                | Primary supported target.                                                                                                              |
| Multiple roots, same tested versions, shared runtime and explicit scoped providers | Supported target, gated by the two-remote fixture.                                                                                     |
| Separate copies of the same runtime in one document                                | Robustness investigation; document limitations until the required coordination cases pass.                                             |
| Different Salt/theme versions in one document                                      | No general coexistence guarantee. Requires a separate compatibility and selector-isolation design.                                     |
| Separate documents/windows                                                         | Preserve existing documented behavior; verify theme and style targeting separately from the historical scroll-lock policy.             |
| Shadow DOM                                                                         | Future capability requiring style roots, portal destinations, focus, and accessibility validation. A theme scope is not a shadow root. |

## Runtime fixes and two-remote evidence

Create a small host with two independently mounted remotes and controls that exercise dialogs, a menu, a tree, responsive layout, and nested theme regions. Provide a correctly shared-runtime case and an intentionally duplicated-runtime case. Keep the latter labeled as a diagnostic scenario until its supported behavior is defined.

The fixture must vary mount order, close order, remote unmount/remount, open overlays during appearance changes, and independent-root configuration. Record runtime module identities alongside observable output so a passing shared-copy test is not mistaken for evidence about duplicate copies.

Prioritize the following changes after reproducing their failure:

- **Document effects:** Ensure that closing one active modal cannot restore scrolling while another supported modal still requires a lock. If duplicate copies must coordinate, design a document-scoped, versioned ownership protocol; do not place unversioned implementation objects on a global and call mixed-version support solved. Preserve the existing desktop scroll-target contract until its replacement is explicitly approved.
- **IDs:** Move eligible modern React consumers of the eager counter path onto a hydration-safe React ID path. Establish the legacy fallback and first-render requirements before changing it. Keep domain selection identity separate from DOM IDs; [RFC 001](./001-component-contracts-and-react.md) owns the broader component contract.
- **Provider ownership:** Make competing-root diagnostics actionable and verify cleanup against preexisting document attributes. The supported design has one root owner. Automatic transfer between competing providers is a separate feature, not required to make the supported design reliable.
- **Style placement:** Make reuse honor the agreed insertion scope as well as CSS and nonce identity. Test two insertion points, cleanup counts, route churn, and foreign/removed insertion nodes. A second requested placement must not silently inherit the first caller's placement.
- **Breakpoints:** Verify omitted nested configuration and target-window behavior, including popup providers. If inheritance becomes the intended behavior, document the correction and an explicit default-reset route rather than silently assuming all existing nested providers wanted inheritance.
- **Tokens:** Validate the exact published assets used by the fixture. Missing required tokens and mismatched theme layers need actionable diagnostics or documentation. Do not claim support for a version pair solely because the packages install together.

Track stylesheet node counts, mount/remount behavior, initial styling, and delivered CSS/JavaScript where they help assess a concrete inefficiency. This RFC includes no claimed performance improvement and imports no measurements from the excluded build investigation.

## Plain CSS and CSS Modules

### Recommendation

Plain CSS remains a suitable default for Salt's current consumers. It already expresses the token-based theme and stateful selectors, works with both existing delivery routes, and keeps the current customization surface understandable. The immediate defects above concern runtime identity, ownership, and precise contracts; changing class naming alone would leave most of them in place.

CSS Modules are a credible option when Salt wants implementation selectors to be locally named by default. Their defined model scopes class and animation names locally and supplies a mapping to emitted names. This can reduce accidental naming collisions and make dependencies between a component and its private stylesheet explicit. [CSS Modules documentation][css-modules]

The output still participates in the document's normal CSS cascade. For Salt, this means local names alone do not isolate inherited custom properties, broad element selectors, document effects, portal configuration, or duplicated runtime modules. Two copies of the same packaged release may intentionally use the same generated names; separately named releases can still share global tokens and browser state. CSS Modules therefore address a specific selector problem, not a complete MFE isolation contract.

### Compatibility and a possible pilot

Before a conversion, inventory documented styling hooks, actual consumer overrides, component custom properties, internal state classes, and extension-package selectors. The current code's readable names do not make every internal selector an approved public API. Equally, changing names without understanding supported dependencies can break consumers. Salt's [extended-styling guidance][extended-styling] continues to govern approved themes and unsupported white-labeling.

A useful future pilot would convert private implementation selectors for one representative component and one portalled surface while retaining explicit supported tokens, root classes, and styling hooks. It must prove:

1. Deterministic names and matching markup/styles across server and client, package entry points, and static/injected CSS.
2. Preservation of supported override behavior, selector specificity, state styling, and accessibility output.
3. A documented mapping between private selectors and any deliberately stable external hooks, without exposing generated hashes as a public API.
4. Behavior with two copies and, if requested, two releases. Naming identity across releases must be designed rather than assumed.
5. A measurable maintenance or collision benefit sufficient to justify migration and parallel contracts.

If the pilot succeeds, prefer incremental use on new or deliberately revised internals. A later major release could establish private selectors and explicit theme boundaries more broadly. It is premature to promise a full conversion or a performance benefit from the naming change.

### Other alternatives

| Alternative                                    | Useful capability                                                                                      | Reason it is not the immediate default                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing static CSS route                      | Explicit stylesheet loading and compatibility with applications that prohibit injected style elements. | Already available; requires complete package CSS and agreement about injection ownership.                                                           |
| React 19 stylesheet resources                  | React can place and deduplicate styles using `href` and `precedence`.                                  | Identity, ordering, CSP, target-document behavior, and persistence differ from Salt's current lifecycle. The general React floor remains unchanged. |
| Private CSS Modules                            | Local class and animation naming.                                                                      | Does not solve the broader runtime contract; requires an override inventory and a bounded pilot.                                                    |
| New global cascade layers                      | An explicit cascade ordering model.                                                                    | Can change consumer override precedence and requires compatibility evidence.                                                                        |
| Shadow DOM or independently isolated documents | Stronger DOM/style boundaries for deliberately independent applications.                               | Changes integration, portals, focus, accessibility, and asset ownership; exceeds the standardized same-version scenario.                            |

React's documented resource behavior includes immutable props after initial rendering and possible style persistence after unmount. A resource `href` must identify the stylesheet correctly; a component name alone cannot distinguish changed CSS. Those are reasons to test a resource strategy on its own merits rather than expose several new style modes speculatively. [React style resources][react-style]

## Delivery sequence and acceptance

The appearance and runtime tracks can proceed independently. Keep each compatibility correction reviewable; do not combine all investigations into one implementation PR.

| Slice                   | Deliverable                                                                                          | Acceptance before expansion                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Appearance PR1          | Add `mode="system"` to both providers, documentation, and focused tests.                             | Existing defaults and resolved types unchanged; explicit overrides, inheritance, open portals, target windows, subscription cleanup, SSR, and hydration covered. |
| Appearance PR2          | Initial-document recipes and any narrowly justified bootstrap integration.                           | Real initial-load evidence for saved and system preferences; truthful color-scheme signal; deterministic handoff; storage/script failure behavior documented.    |
| Compatibility follow-up | Standalone asset fixtures and CSS support audit; fix evidenced gaps.                                 | Injection and static routes tested separately; current browser floor retained; rendered states and forced colors assessed.                                       |
| Runtime PR1             | Two-remote fixture plus shell/provider/version ownership guide.                                      | Shared and duplicate module cases distinguishable; mount order, overlays, theme changes, IDs, and independent roots observable.                                  |
| Runtime follow-ups      | Separate fixes for reproduced ID, scroll, ownership, placement, or breakpoint issues.                | Each fix has a failing case first, an explicit compatibility assessment, and a passing fixture after the change.                                                 |
| Optional experiments    | Adaptive tokens, private CSS Modules, or React 19 resources, selected only for an unmet requirement. | Compare against the current path; demonstrate benefit and preserve required contracts before proposing public adoption.                                          |

Before a capability is advertised as supported, its delivery slice should satisfy the relevant observable conditions below. An independent appearance release does not need to wait for all runtime investigations:

- Legacy applications see no unsolicited mode change, new persistence behavior, or loss of supported styling hooks.
- Theme changes keep React state, DOM theme attributes, browser controls, and portalled content coherent without losing focus or field state.
- Independent roots following the integration guide do not compete for document theme ownership.
- Closing or unmounting a remote cannot remove CSS or document effects still required by another supported remote.
- IDs and accessibility references remain unambiguous in the supported multi-root setup.
- Any statement about minimum-browser support, SSR, or duplicate runtimes is backed by tests for that exact environment, with manual checks recorded where automated engines are insufficient.

For Safari's adaptive transformation, computed authored colors alone cannot verify the result; use real-browser visual inspection where that feature is available. Keep that evidence separate from ordinary authored dark-mode screenshots.

## Open decisions and risks

1. **Initial system snapshot:** What explicit handoff, if any, should Salt expose for applications that need system appearance before hydration? Decide through the PR2 recipes, without widening the initial provider feature into a persistence framework.
2. **Duplicate runtime support:** Is a single shared runtime a sufficient application contract, or must same-version duplicate copies coordinate document effects? The fixture makes the cost and residual failures visible before a shared protocol is committed.
3. **Desktop scroll target:** Does the existing main-window behavior remain the desired contract? Theme-window correctness does not by itself authorize a scroll-target change.
4. **Public styling boundary:** Which tokens, classes, and slots are supported customization points? Resolve this before promising private-selector migration, rather than freezing every current class or removing relied-on hooks implicitly.
5. **Modern CSS value:** Which measured limitation warrants adaptive tokens or a newer cascade mechanism after system appearance and initial-document integration? The default outcome of an inconclusive experiment is to retain the proven path.

The primary risks are a hydration/first-paint mismatch, accidental changes to inherited configuration or overrides, and overstating the isolation provided by a new CSS technique. The staged plan limits those risks by separating additive preferences, application integration, demonstrated correctness fixes, and optional experiments.

## References

Repository references are pinned to the source baseline. External specifications and documentation were inspected on November 6, 2026; browser beta behavior and draft specifications require rechecking before implementation.

[platforms]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/about/supported-platforms.mdx
[mode-source]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/theme/Mode.ts
[provider]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/salt-provider/SaltProvider.tsx
[global-css]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/theme/src/css/global.css
[theme-entry]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/theme/src/index.css
[applicator]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/salt-provider/ThemeApplicator.tsx
[floating]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useFloatingUI/useFloatingUI.tsx
[injector]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/styles/src/use-style-injection/useStyleInjection.ts
[scroll-lock]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/usePreventScroll.ts
[ids]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useId.ts
[tree-node]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/tree/TreeNode.tsx
[breakpoints]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/breakpoints/BreakpointProvider.tsx
[core-package]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/package.json
[theme-package]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/theme/package.json
[button]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/button/Button.tsx
[button-css]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/button/Button.css
[style-guide]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/getting-started/style-injection.mdx
[mode-guide]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/foundations/modes.mdx
[extended-styling]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/themes/extended-styling.mdx
[react-context]: https://react.dev/reference/react/useContext
[react-portals]: https://react.dev/reference/react-dom/createPortal
[react-roots]: https://react.dev/reference/react-dom/client/createRoot
[react-hydration]: https://react.dev/reference/react-dom/client/hydrateRoot
[react-style]: https://react.dev/reference/react-dom/components/style
[webkit-adaptive]: https://webkit.org/blog/18541/introducing-adaptive-dark-mode/
[color-adjust]: https://drafts.csswg.org/css-color-adjust/#color-scheme-prop
[light-dark]: https://drafts.csswg.org/css-color-5/#light-dark
[css-variables]: https://www.w3.org/TR/css-variables-1/#invalid-at-computed-value-time
[css-modules]: https://github.com/css-modules/css-modules
