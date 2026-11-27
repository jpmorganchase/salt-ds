# RFC 005: Interaction telemetry

| Item               | Value                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status             | Draft for team discussion; no implementation or API approval implied                                                                                                                                                                                                      |
| Date               | November 27, 2026                                                                                                                                                                                                                                                         |
| Source baseline    | [`3bd9580d2a09e9bc0415efd30469f211256fe08f`](https://github.com/jpmorganchase/salt-ds/commit/3bd9580d2a09e9bc0415efd30469f211256fe08f)                                                                                                                                    |
| Decision requested | Agree that Salt components report semantic interaction events through an opt-in, vendor-neutral context; authorize an internal emitter and a popup/selection pilot                                                                                                        |
| First delivery     | An internal event contract and emitter, exercised through the RFC 001 popup conformance harness for `Dialog`, `Menu`, `Dropdown`, and `ComboBox`, with a test listener                                                                                                    |
| Related proposals  | [Component contracts](./001-component-contracts-and-react.md), [native forms](./002-native-form-integration.md), [theme and runtime integration](./003-theme-and-runtime-integration.md), [guidance and maintainer workflows](./004-guidance-and-maintainer-workflows.md) |

## Summary

Applications measure how people use Salt-based interfaces mostly through analytics tools that observe the DOM. Those tools see clicks on generated IDs and portalled nodes, miss keyboard selections, and cannot tell why a popup closed. Application teams compensate by adding analytics attributes to individual elements.

Salt knows what an interaction means at the moment it happens: which component handled it, whether it was a selection or a dismissal, which input caused it, and which dialog or field it belongs to. This RFC proposes that Salt report that information as small, documented events through an opt-in React context. Applications decide where events go. Salt does not transmit, store, or sample data and does not become an analytics SDK.

The proposal builds on RFC 001 rather than adding a parallel mechanism. Events are recorded at Salt's existing internal notification points, use RFC 001's change reasons and selection identity, and are verified by its popup conformance harness. Existing `on*` callbacks keep their signatures, arguments, and timing. Applications that do not register a listener see no behavioral, DOM, or callback change.

## 1. Problem and verified starting point

DOM-observing analytics tools typically attach document-level listeners and identify an element from its `id`, a test ID, `name`, classes, or nearby text. They attribute context by walking DOM ancestors. These observations describe how Salt's current implementation interacts with that approach. They are verified against the pinned baseline and describe implementation and documented types, not defects.

| Area                     | Current behavior                                                                                                                                                                                                                                                                                                                                                                                                           | Consequence for DOM-observed analytics                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated IDs            | `useId` returns React's generated ID when available and otherwise a `salt-N` counter. `Option` uses it for its DOM `id`. [IDs][salt-ids], [option][salt-option]                                                                                                                                                                                                                                                            | IDs serve associations, not identity. React reserves `useId` for that purpose. [React: `useId`][react-id] Tools that treat them as identity record unstable values. |
| Floating surfaces        | `Dialog`, `Drawer`, `Menu`, `Overlay`, `Tooltip`, `Toggletip`, the option list, and several overflow surfaces use `useFloatingUI`'s default floating component, which renders a `FloatingPortal` with a scoped provider. [Floating component][salt-floating-portal]                                                                                                                                                        | DOM-ancestor context, including any opt-out marker on a containing region, does not reach popup content. React context does. [React: `createPortal`][react-portal]  |
| Popup ownership          | `Dropdown` and `ComboBox` set `aria-controls` to the list only while open; `Menu` uses Floating UI's `useRole`. [Dropdown][salt-dropdown-trigger], [ComboBox][salt-combobox-trigger], [menu][salt-menu-role]                                                                                                                                                                                                               | The owner relationship exists in ARIA, but a tool must follow it deliberately to connect an option to its control.                                                  |
| Keyboard selection       | `Dropdown` selects the active option on Enter and Space, and on Tab for single selection. `ComboBox` selects on Enter, and on Tab when `selectOnTab` is enabled, which is its single-selection default. No click reaches the option. [Dropdown][salt-dropdown-keys], [ComboBox][salt-combobox-keys]                                                                                                                        | Click-based capture misses these selections, and no native `change` event fires because the controls are not native selects.                                        |
| Field labels             | `FormFieldLabel` renders a `<label>` without `htmlFor`; `Input` refers to it through `aria-labelledby`. [Label][salt-form-label], [input][salt-input-labelledby]                                                                                                                                                                                                                                                           | Tools that read `HTMLInputElement.labels` find no label for Salt inputs.                                                                                            |
| Open and dismiss reason  | `useFloatingUI` forwards Floating UI's `(open, event, reason)` arguments. `Dialog` passes its `onOpenChange` straight through, so they arrive at runtime although the public type is `(open: boolean) => void`. `Menu` forwards only the boolean. List controls expose `"input"` or `"manual"`. [Handler][salt-floating-change], [dialog][salt-dialog-change], [menu][salt-menu-change], [list controls][salt-list-reason] | The information that distinguishes Escape, outside press, and trigger press exists internally but has no documented contract.                                       |
| Existing instrumentation | No analytics or telemetry module exists in the published packages at the baseline.                                                                                                                                                                                                                                                                                                                                         | Each application or tool reconstructs interaction semantics independently.                                                                                          |

Several of these are correct React and accessibility practice. The conclusion is that DOM observation is the wrong source of semantics for Salt components, not that Salt should change these choices.

## 2. Goals and boundaries

The goals are:

1. Applications that opt in receive meaningful events for Salt interactions without per-element markup.
2. Events carry identity and context that survive portals, keyboard input, generated IDs, and independently mounted roots.
3. Events exclude values and user-entered text by default.
4. Applications that do not opt in observe no change in callbacks, timing, DOM output, or behavior, and pay negligible runtime cost.
5. Salt defines events; applications choose destinations.

Salt does not transmit, batch, store, or sample events, or manage sessions, consent, or user identity. It does not report application outcomes such as a completed save or a server validation result. It does not replace business events that only the application can describe. Adapters for specific vendors or organization-internal tools are outside the public packages. This RFC does not change any `on*` signature and does not introduce document-wide capture.

## 3. Prior art

External documentation was checked on November 27, 2026.

| System                               | Approach                                                                                                                                                                                                                                                                         | What Salt should adopt                                                                   | What Salt should avoid                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Atlassian `@atlaskit/analytics-next` | Components create events with `action`, `actionSubject`, `componentName`, `packageName`, and `packageVersion`. `AnalyticsContext` accumulates tree context; `AnalyticsListener` receives events by channel. [Package][atlaskit-analytics]                                        | Component-emitted events with package identity and accumulated tree context.             | Delivering events as an extra argument to public callbacks, which conflicts with RFC 001 sections 5 and 7. |
| Backstage Analytics API              | Events are an `action`, a `subject`, attributes, and context. Plugin and route context is added automatically. Destinations implement a small API and ship as separate modules. [Backstage][backstage-analytics]                                                                 | A small vocabulary, automatic context, and pluggable destinations kept outside the core. | Coupling event capture to routing concepts that Salt does not own.                                         |
| GOV.UK Publishing Components         | The component library ships GA4 trackers with a shared schema. No analytics code runs without consent, and a PII-removal module filters data. [GOV.UK][govuk-analytics]                                                                                                          | A library-owned schema and data minimization; consent enforced before delivery.          | Coupling the library to one analytics vendor.                                                              |
| PostHog and Amplitude autocapture    | DOM capture records interactions with element chains and text. Data attributes opt out or add properties. Analysts label events later. Amplitude positions autocapture as a baseline beside precise tracking. [PostHog][posthog-autocapture], [Amplitude][amplitude-autocapture] | DOM capture remains a useful baseline for markup Salt does not render.                   | Treating DOM observation as the source of semantics for Salt components.                                   |
| Sentry React component names         | A build plugin annotates DOM elements with React component names because CSS selectors are ambiguous. [Sentry][sentry-components]                                                                                                                                                | Stable names matter more than selectors.                                                 | Build-time annotation is unnecessary for Salt components, which can name their own events.                 |

## 4. Event model

An event records one interaction request handled by a Salt component. The shape below is illustrative; names are not approved API.

```ts
// Illustrative only.
interface SaltInteractionEvent {
  schemaVersion: 1;
  package: string; // for example "@salt-ds/core"
  packageVersion: string;
  component: string; // public component name, for example "Dropdown"
  action: string; // from the component's documented vocabulary
  name?: string; // see section 6
  reason?: string; // component-specific, for example "escape-key"
  input?: "pointer" | "keyboard" | "unknown";
  attributes: Readonly<Record<string, string | number | boolean>>;
  context: ReadonlyArray<Readonly<Record<string, string | number | boolean>>>;
  timeStamp: number;
}
```

Each component family documents its actions, reasons, and attributes in its RFC 001 contract record. The pilot vocabulary is:

| Family                 | Actions                                           | Default attributes             | Notes                                                                                                                      |
| ---------------------- | ------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `Button`               | `press`                                           | `type`                         | `useButton` does not call `onClick` while disabled or loading, so those clicks are not reported. [Button][salt-use-button] |
| `Dialog`               | `openRequest`, `closeRequest`                     | `status` when set              | Reasons map from Floating UI's dismissal reasons and Salt-owned close controls.                                            |
| `Menu`                 | `openRequest`, `closeRequest`, `itemPress`        | `nested`                       | Menu-chain dismissal records which layer handled the request, following RFC 001 scenario 2.                                |
| `Dropdown`, `ComboBox` | `openRequest`, `closeRequest`, `selectionRequest` | `multiselect`, `selectedCount` | Covers pointer and keyboard selection. Option identity is included only through section 6. Query text is never included.   |

Salt reports requests, named with a `Request` suffix where acceptance is not guaranteed. RFC 001 separates a requested change from an accepted controlled value, and applications own Actions, persistence, and their results. Applications report outcomes, such as a saved form or a rejected selection, as their own events. Programmatic changes to controlled props are not user interactions and produce no events.

Example: a keyboard user selects "EUR" in a `Dropdown` labeled "Currency" inside a dialog titled "New trade", in an application area the application has labeled `trade-ticket`.

```json
{
  "schemaVersion": 1,
  "package": "@salt-ds/core",
  "packageVersion": "1.x.y",
  "component": "Dropdown",
  "action": "selectionRequest",
  "name": "Currency",
  "input": "keyboard",
  "attributes": { "multiselect": false, "selectedCount": 1 },
  "context": [
    { "area": "trade-ticket" },
    { "component": "Dialog", "name": "New trade" }
  ],
  "timeStamp": 1234.5
}
```

The selected label "EUR" is absent by default. Section 6 describes how an application can opt in to a stable option identity.

## 5. Context

Context is carried by React context, not reconstructed from the DOM.

```tsx
// Illustrative names; not approved API.
<InteractionListener onEvent={send}>
  <InteractionScope data={{ area: "trade-ticket" }}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader header="New trade" />
      <DialogContent>
        <FormField>
          <FormFieldLabel>Currency</FormFieldLabel>
          <Dropdown>{/* options */}</Dropdown>
        </FormField>
      </DialogContent>
    </Dialog>
  </InteractionScope>
</InteractionListener>
```

| Source                      | Contract                                                                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application scopes          | Applications add business context once per area. Values are primitives with documented key and length limits. This keeps them serializable from Server Components and limits accidental data capture. [React: serializable props][react-use-client]                            |
| Automatic container scopes  | Salt containers with a Salt-owned name contribute a scope. The pilot covers `Dialog`, named by its header. Tab panels and other containers follow only after the pilot.                                                                                                        |
| Field names                 | `FormField` supplies the name of its control rather than a separate scope, so the control's event is named "Currency" without duplicating the field.                                                                                                                           |
| Portals                     | Popup content renders inside its owner's React tree, so popup events inherit the owner's scopes without following `aria-controls`.                                                                                                                                             |
| Independently mounted roots | DOM nesting does not carry React context across roots. Following RFC 003, the shell passes the listener and any application scopes to each remote root's providers explicitly. Microfrontend attribution becomes an application scope such as an application code and version. |
| Shared module instances     | The context must come from the shared Salt module instance described in RFC 003. Duplicated runtime copies produce separate contexts, which the two-remote fixture should detect.                                                                                              |

Context is a snapshot taken when the event is recorded. It reflects the committed React tree that handled the interaction, not DOM state that a pending Transition may later change.

## 6. Names, identity, and data minimization

**Identity.** An event identifies its subject in this order: an application-supplied stable identifier, if one is provided through an API to be decided; otherwise the component, its name, and its scope path. Generated DOM IDs are never used. Option identity uses RFC 001's selection identity mechanism, coordinated with RFC 002, and is included only when the application opts in. Labels are not used as entity identity.

**Names.** Salt computes a name from relationships it owns: `aria-label`, `aria-labelledby` targets, `FormField` labels, dialog headers, and the text content of buttons, menu items, and tabs. This is a bounded computation over Salt's own markup, not a general accessible-name implementation. Names are truncated to a documented length.

**Interface text versus data.** By default, names of controls and containers are included because they are usually interface text written by the application author. Option labels, input values, query text, selected values, and free text inside components are excluded because they usually contain data. Some interface text contains data, such as a tab named after a client, so the default is an open decision.

**Masking.** An application can mark a scope as masked. Masking suppresses names and optional attributes for every event within that scope. Because masking uses context, it also applies to popup content rendered in portals.

Consent, retention, sampling, and organization-specific PII rules are enforced by destinations, as in the GOV.UK approach. Salt's responsibility is to avoid producing sensitive data by default.

## 7. Emission and delivery rules

1. **Record only in interaction handlers.** Salt records events in event handlers and Salt-owned interaction paths, never during render, in Effects, or in ref callbacks. Rendering must be pure, Strict Mode replays Effects in development, and `<Activity>` cleans up Effects when content is hidden and runs them again when it becomes visible. [React purity][react-purity], [Strict Mode][react-strict-mode], [`<Activity>`][react-activity]
2. **Keep public callbacks unchanged.** Signatures, argument meanings, invocation order, and timing stay as they are. No telemetry behavior is added to `mergeProps` or `createChainedFunction`. This follows RFC 001 sections 5 and 7.
3. **Snapshot synchronously, deliver later.** Salt builds an immutable event in the handler and delivers it to listeners in recording order after the handler completes. Listener work therefore does not lengthen the interaction's event processing. [web.dev: INP][web-inp] The scheduling mechanism is an open decision.
4. **Isolate listeners.** A listener exception is caught and reported in development. It never changes component behavior or prevents application callbacks.
5. **Cost nothing without a listener.** With no listener registered, Salt creates no event objects, computes no names, and reads no DOM.
6. **Emit once.** One interaction request produces one event from the component that handled it. Nested popups follow the layer-handling policy that RFC 001 defines.
7. **Leave Transitions and Actions to the application.** Salt does not wrap recording in Transitions or await callbacks. If RFC 001 later approves a Salt-owned Action prop, its pending lifecycle becomes eligible for events. That is supporting evidence for RFC 001 open decision 6, not a justification by itself.
8. **Keep the support floor.** The common implementation uses context and refs compatible with React 16.14 onward. Listener registration is client-only.

## 8. Destinations and DOM capture

Salt should ship a test listener for unit and browser tests and a development listener, such as a Storybook panel, that shows events as they are recorded. Vendor and organization-internal adapters live outside the core packages. Internal adapters live in internal repositories.

An adapter documents its mapping to destination event names and its batching, consent, sampling, and PII policy. It should avoid blocking interaction handling.

An application that also runs DOM interaction capture will count Salt interactions twice. The pilot should disable DOM interaction capture and keep page-level capture. Two longer-term options need evidence before a decision. The first is a documented marker that DOM tools can use to skip Salt-instrumented controls; it would be a visible DOM change. The second is deduplication at the destination. Markup that Salt does not render continues to rely on DOM capture or explicit application events.

## 9. Relationship to RFCs 001–004

| RFC and area                        | Relationship                                                                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001, shared behavioral contract     | Add a telemetry row to each contract record: actions, reasons, recording point, and duplicate policy.                                                                             |
| 001, popup conformance pilot        | Assert event count, action, reason, and input for the open, close, nesting, and lifecycle scenarios.                                                                              |
| 001, event details and cancellation | The internal reason prototype gains a first consumer without changing public callbacks. This answers RFC 001 open decision 3 for the pilot families.                              |
| 001, selection identity             | Option identity in events uses the same mechanism as selection and form serialization.                                                                                            |
| 001, lifecycle and Compiler fixture | Add event counts under Strict Mode, unmount during interaction, and compiled consumers.                                                                                           |
| 002, native forms                   | Value-commit and validation-shown events, if added later, use RFC 002's commit boundaries and report field identity, never values. Submission outcomes stay with the application. |
| 003, provider and runtime ownership | The context lives in the shared core module. Independent roots receive explicit providers. The two-remote fixture covers listener and scope propagation.                          |
| 004, guidance                       | Generate the per-component event catalog from the same owned sources as the documentation. Guidance must not describe events that the code does not record.                       |

This RFC asks that RFC 001's internal reason prototype, currently a conditional slice, start alongside the popup pilot, because telemetry supplies the application need that RFC 001 requires.

## 10. Delivery and acceptance gates

| Slice                            | Deliverable                                                                                                             | Acceptance gate                                                                                                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Internal contract and emitter | Unexported event types, recording and delivery utility, and a test listener.                                            | Existing tests pass without changes to callbacks, DOM output, or behavior. No work is performed without a listener. Bundle size change is reported.                                             |
| 2. Popup and selection pilot     | Events for `Button`, `Dialog`, `Menu`, `Dropdown`, and `ComboBox`, asserted through the popup harness.                  | Exactly one event per scenario with the correct action, reason, and input, including keyboard selection and Strict Mode, across the applicable React and browser matrix.                        |
| 3. Context                       | Listener and scope providers, `Dialog` scopes, `FormField` names, masking, and two-remote coverage shared with RFC 003. | Popup events carry their owner's scopes. Masked scopes suppress names in portals. Independent roots receive only explicitly provided context.                                                   |
| 4. Developer tooling             | Storybook panel, test helper, and a generated event catalog.                                                            | The catalog is generated from source and matches events asserted in tests.                                                                                                                      |
| 5. Consumer pilot                | One application with an internal adapter and DOM interaction capture disabled.                                          | Agreed analytics questions are answerable. Report the share of events with a name and at least one scope, per-element attributes removed, duplicates, and interaction latency against a budget. |
| 6. Publication decision          | Public names, stability marking, compatibility policy for event names and attributes, and order of further families.    | The team records the compatibility policy before any event becomes a documented contract.                                                                                                       |

Slices 1 and 2 can start alongside RFC 001's popup pilot. Slice 3 coordinates with RFC 003's runtime fixture. Slices 4 and 5 depend on slice 3. This documentation branch does not claim any of these checks have run.

## 11. Alternatives and risks

**Improve DOM observation only.** Accessible-name computation, `aria-controls` traversal, and landmark scopes would improve any DOM-based tool and are worth recommending to tool owners for markup Salt does not render. They cannot recover keyboard selections without click events, dismissal reasons, or option identity, and they depend on DOM details Salt does not treat as a contract.

**Pass events through public callbacks.** Adding an analytics argument to `on*` callbacks changes established signatures. RFC 001 already uses the second list-control argument for a reason string.

**Dispatch DOM custom events from components.** Events from portalled content bubble to the document body rather than to the owning control, losing context. They would also add observable behavior to every component.

**Build a Salt analytics SDK.** Transport, sessions, consent, and data governance belong to existing analytics owners. A second SDK on the same page fragments data and duplicates events.

**Keep per-element attributes.** This works today but is costly, inconsistent between teams, and still misses keyboard and popup context.

| Risk                           | Mitigation                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Sensitive data in names        | Interface-text-versus-data rule, masking scopes, truncation, and review of every default attribute.         |
| Event volume and cost          | Request-level events only, destination sampling, and measurement in the consumer pilot.                     |
| Schema churn after publication | `schemaVersion`, a generated catalog, and an explicit compatibility policy before publication.              |
| Interaction latency            | No-listener fast path, deferred delivery, and latency measurement in the pilot.                             |
| Maintenance across the catalog | Start with pilot families; add telemetry to contract records and harness cases rather than separate suites. |
| Requests read as outcomes      | `Request` naming, documentation, and application-owned outcome events.                                      |

## 12. Open decisions for the team

1. Should listener registration be part of `SaltProvider` or a separate provider? RFC 003 requires one owner for each shared mechanism.
2. Should control and container names be included by default, or only when the application opts in?
3. Which delivery scheduling mechanism should Salt use, and what ordering does it guarantee?
4. Should an event be recorded before or after the corresponding public callback runs?
5. How should an application correlate a Salt request with its own outcome event?
6. Should Salt provide a marker for DOM tools to skip Salt-instrumented controls?
7. Are event names and attributes covered by semantic versioning once published?
8. Which families follow the pilot: tabs, pagination, accordion, selection controls, or committed text input?

## References

Salt source links are pinned to the assessed baseline.

[salt-ids]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useId.ts#L22-L28
[salt-option]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/option/Option.tsx#L69-L157
[salt-floating-portal]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useFloatingUI/useFloatingUI.tsx#L81-L100
[salt-floating-change]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useFloatingUI/useFloatingUI.tsx#L230-L237
[salt-dropdown-trigger]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/dropdown/Dropdown.tsx#L473-L484
[salt-dropdown-keys]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/dropdown/Dropdown.tsx#L356-L378
[salt-combobox-trigger]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/combo-box/ComboBox.tsx#L434
[salt-combobox-keys]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/combo-box/ComboBox.tsx#L277-L303
[salt-menu-role]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/menu/MenuBase.tsx#L145
[salt-menu-change]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/menu/MenuBase.tsx#L84-L101
[salt-dialog-change]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/dialog/Dialog.tsx#L52
[salt-list-reason]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/list-control/ListControlState.ts#L22-L56
[salt-use-button]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/button/useButton.ts#L94
[salt-form-label]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/form-field/FormFieldLabel.tsx#L60
[salt-input-labelledby]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/input/Input.tsx#L234
[react-id]: https://react.dev/reference/react/useId
[react-portal]: https://react.dev/reference/react-dom/createPortal
[react-use-client]: https://react.dev/reference/rsc/use-client#serializable-types
[react-purity]: https://react.dev/reference/rules/components-and-hooks-must-be-pure
[react-strict-mode]: https://react.dev/reference/react/StrictMode
[react-activity]: https://react.dev/reference/react/Activity
[web-inp]: https://web.dev/articles/optimize-inp
[atlaskit-analytics]: https://unpkg.com/@atlaskit/analytics-next/dist/types/index.d.ts
[backstage-analytics]: https://backstage.io/docs/plugins/analytics/
[govuk-analytics]: https://github.com/alphagov/govuk_publishing_components/blob/main/docs/analytics-ga4/analytics.md
[posthog-autocapture]: https://posthog.com/docs/product-analytics/autocapture
[amplitude-autocapture]: https://amplitude.com/docs/data/autocapture
[sentry-components]: https://docs.sentry.io/platforms/javascript/guides/react/features/component-names/
