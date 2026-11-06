# RFC 001: Component contracts and React integration

| Item               | Value                                                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status             | Draft for team discussion; no implementation or API approval implied                                                                                                                                       |
| Date               | November 6, 2026                                                                                                                                                                                           |
| Source baseline    | [`3bd9580d2a09e9bc0415efd30469f211256fe08f`](https://github.com/jpmorganchase/salt-ds/commit/3bd9580d2a09e9bc0415efd30469f211256fe08f)                                                                     |
| Decision requested | Approve shared behavioral contracts, a popup conformance pilot, and application-owned React 19 recipes; authorize bounded composition and identity investigations                                          |
| First delivery     | Popup contract tests and React 19 integration examples, using existing Salt APIs                                                                                                                           |
| Related proposals  | [Native forms](./002-native-form-integration.md), [theme and runtime integration](./003-theme-and-runtime-integration.md), [guidance and maintainer workflows](./004-guidance-and-maintainer-workflows.md) |

## Summary

Improve Salt's consistency and composition while retaining its components, visual language, and supported applications. Start by making behavior explicit and testing it across component boundaries. Then introduce small capabilities where those tests expose a concrete gap.

Salt needs explicit change reasons where applications use them, composable interaction parts, stable selection identity, and complete lifecycle handling. This proposal develops those contracts within Salt's existing architecture and preserves supported consumer behavior.

The immediate priorities are a shared popup conformance harness, complete React 19 integration recipes, and a bounded consumer fixture for lifecycle and React Compiler compatibility. Typed composition and stable selection identity follow as focused prototypes. New callback metadata is conditional on demonstrated application needs.

Existing `on*` callbacks retain their signatures and immediate notification behavior. Salt does not automatically await their return values or put them inside Transitions. A future `action` or `*Action` prop would promise an actual Action lifecycle and needs a separate, complete contract before publication.

## 1. Problem and verified starting point

Salt already has substantial infrastructure. The problem is that an application composing components must understand several local contracts for state, focus, rendering, and events. A successful test of one component does not necessarily prove that a menu inside a dialog behaves correctly when both are controlled or unmount during an interaction.

These observations are verified against the pinned baseline. They describe implementation and documented policy, not newly measured defects.

| Area                     | Current foundation                                                                                                                                                                     | Opportunity                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Supported React versions | The contribution policy supports React 16.14 onward, requires compatible APIs, and describes React 16–19 browser and consumer-type checks.                                             | Keep the common component implementation compatible while documenting richer application integration for React 19.                |
| Floating surfaces        | `useFloatingUI`, `FloatingComponentProvider`, and `FloatingPlatformProvider` support positioning, focus management, alternate floating surfaces, and target-platform integration.      | Exercise the shared behavior across popup families and custom floating implementations.                                           |
| Popup callbacks          | `Dialog`, `Menu`, and `Overlay` expose boolean open notifications. List controls also expose the narrower optional `"input"` or `"manual"` reason.                                     | Determine where application decisions need additional information without changing existing parameter meanings.                   |
| Controlled state         | `useControlled` separates controlled and uncontrolled ownership and warns about changing that ownership.                                                                               | Specify request, commit, callback, and focus timing for each component family.                                                    |
| Selection                | `useListControl` has a registry and per-option store. Selection paths compare item values directly, including object identity.                                                         | Define how remote data, recreated objects, and temporarily unmounted options should be represented before adding an identity API. |
| Composition              | `renderProps` supports JSX elements and callback rendering. `RenderPropsType` currently accepts an `any` callback argument. `mergeProps` chains events and merges classes/styles.      | Add useful types and test prop/ref/event behavior without silently replacing established merging rules.                           |
| Refs and IDs             | `useForkRef`/`forkRef` already accommodate React 19 ref cleanup; `useId` uses React's API when available and has a legacy fallback. `useIdMemo` remains a separate counter-based path. | Reuse working compatibility mechanisms and audit their boundaries rather than introduce parallel helpers.                         |
| Button feedback          | `Button` already exposes `loading` and `loadingAnnouncement`, and defaults to `type="button"`.                                                                                         | Build application-owned save and submit recipes with existing capabilities.                                                       |

Sources: [contribution policy][salt-contributing], [floating integration][salt-floating], [dialog][salt-dialog], [menu][salt-menu], [overlay][salt-overlay], [list controls][salt-list], [controlled state][salt-controlled], [render utility][salt-render], [prop merging][salt-merge], [ref handling][salt-refs], [IDs][salt-ids], and [button][salt-button].

## 2. Goals and boundaries

The goals are predictable behavior in composed interfaces, safe React 19 adoption by applications, clearer extension points, and evidence that compatible releases remain compatible.

This RFC covers interaction state, popup lifecycle, focus, cancellation boundaries, render composition, selection identity, and React integration. [RFC 002](./002-native-form-integration.md) owns submission values, validation, reset, and field/form architecture. [RFC 003](./003-theme-and-runtime-integration.md) owns document-level styling and runtime coordination. [RFC 004](./004-guidance-and-maintainer-workflows.md) owns how the resulting contracts reach humans and agents.

The proposal preserves Salt's architecture, React and browser minimums, component names, and styling system. Universal polymorphism and converting every callback into an Action are outside its scope. It excludes the separate build-tooling discussion. The Compiler fixture below is a consumer compatibility check, not a proposal to change how Salt publishes its packages.

## 3. Design priorities for Salt

The following priorities address the integration needs identified in Salt's current implementation. Each improvement needs a concrete consumer case and a compatible adoption path.

| Concern                         | Requirement for Salt                                                                | Proposed approach                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Change reasons and cancellation | Applications can distinguish interactions when they need different responses.       | Define component-specific reasons and cancellation only for demonstrated needs; preserve existing callback timing and argument meanings. |
| Selection identity              | Selection survives data refreshes without depending on labels or object references. | Separate entity identity from labels, DOM IDs, and serialized values; test remote-data and temporarily absent-option behavior.           |
| Migration                       | Consumers can adopt a new contract one component or screen at a time.               | Document changed behavior and provide focused migration examples when an explicit adoption boundary is needed.                           |
| Interaction state               | Complex components have predictable transitions and cleanup.                        | Record states and transitions for difficult cases without requiring a new state-management mechanism throughout Salt.                    |
| Composed popups                 | Nested, controlled, and transitioning popups maintain coherent focus and dismissal. | Establish component-specific expectations through shared conformance cases.                                                              |
| Custom rendering                | Required props and refs reach the actual interactive element.                       | Document and test the existing render contract while preserving semantic defaults.                                                       |

## 4. A shared behavioral contract

Create a concise contract record for each affected component family. It should answer the questions below before proposing new APIs.

| Concern         | Contract to record                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| State ownership | Which props are controlled, which defaults initialize internal state, and whether those states can be controlled independently.       |
| Change request  | What user interaction requests a change, what callback fires, and what happens when a controlled owner ignores or delays the request. |
| Commit          | Which committed state determines rendered content, ARIA, focus, and selected option presentation.                                     |
| Event routing   | Callback arguments, invocation order, duplicate-notification policy, and the documented effects of event prevention.                  |
| Focus           | Initial focus, keyboard navigation, return focus, removed targets, pointer interactions, and focus after controlled updates.          |
| Lifecycle       | Exit animation, unmount, reopening before exit completes, effect cleanup, and portal/target-window behavior.                          |
| Accessibility   | Roles, names, descriptions, selected/expanded state, keyboard behavior, and announcement timing.                                      |

Separate a requested state change from an accepted controlled value. Receiving a close request must not make a controlled popup release focus ownership as if it had closed when its `open` prop remains true. Conversely, accepting a close must not leave a stale focus trap because an exit animation is still mounted. Each popup family needs an explicit policy; the harness proves the implementation against it.

Where Salt already promises behavior, a focused regression fix can preserve that promise. Where a proposed behavior changes a valid application contract, use an explicit opt-in or a new surface. A shorter prop list is not sufficient justification for a behavioral change.

### Popup conformance pilot

Start with `Dialog`, `Menu`, `Overlay`, `Dropdown`, `ComboBox`, and `Tooltip`, using small adapters to exercise each family's supported interactions. Shared assertions must allow legitimate differences: tooltips do not trap focus, a menu action can close a menu chain, and a modal dialog has different focus responsibilities from a selection popup.

The first scenarios should establish:

1. Opening and closing through keyboard and pointer input updates the intended component once.
2. Nested popups define which layer handles Escape and outside interaction. Menu-chain dismissal and dialog dismissal have separately reviewed expectations.
3. Focus returns to a valid target after close; if the trigger disappears, the application has a documented fallback instead of an accidental jump.
4. A controlled owner can accept, reject, or delay a request without premature unmounting, misleading ARIA state, or lost focus.
5. Reopening during exit, unmounting an open popup, and Strict Mode effect replay leave no stale listener, focus restriction, or document lock.
6. Portals preserve the intended associations and work through the existing alternate floating-component boundary.

Use the current browser-test infrastructure and extend existing component tests where practical. The output should be a small shared harness plus focused regressions, not a second copy of every component test. Cases exposing document-wide lock or multi-root failures are tracked with RFC 003.

## 5. React 19 integration without changing callback meaning

React describes callbacks invoked inside `startTransition` as Actions and recommends `action` or an `Action` suffix for such props. An exposed Action should be awaited inside the Transition. The name expresses a convention; it does not cause an ordinary callback to acquire that behavior. React also documents post-`await` scheduling and request-ordering limitations. [React: `useTransition`][react-transition].

Salt should use that distinction deliberately:

| Surface                                       | Proposed contract                                                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing DOM handlers and `on*` notifications | Preserve their current arguments and timing. Do not infer an async lifecycle from a returned promise.                                                                                            |
| Application-owned Action                      | The application starts the Transition or uses a native React form Action, owns network work and errors, and passes the resulting state into Salt.                                                |
| Future Salt `action`/`*Action` prop           | Consider only when Salt owns a useful pending lifecycle and can document invocation, awaiting, ordering, errors, cancellation, unmount, and accessibility. No such prop is approved by this RFC. |
| Native `action`/`formAction`                  | Preserve the native React/HTML integration boundary where the rendered element supports it. Do not redefine these names as unrelated Salt callbacks.                                             |

Passing an `async` function to `onSelectionChange` must not quietly postpone a selection or change how a legacy component handles focus. The application can update its local selection immediately and separately start work associated with that choice. Whether a failed save should revert the displayed choice is application policy.

### First three recipes

**Save action.** Show an ordinary Salt `Button` calling an application-owned Action. The application maps pending state to existing loading feedback, announces the outcome, handles failures, and decides whether repeat invocation is allowed. Use an explicit button type and demonstrate unmount and retry behavior. No new `Button.action` prop is needed to establish the pattern.

**Form submission.** Use a real `<form action={...}>`, a Salt submit button with `type="submit"`, and controls whose native participation is verified. Show `useActionState` or form status where it simplifies the application. React resets uncontrolled native form fields after a successful function Action, including a fulfilled Action that returns a validation error object; the recipe must deliberately preserve values when needed. [React forms][react-form] and [`useActionState`][react-action-state].

For the initial recipe, use application-controlled Salt values with an explicit success/reset policy, or first demonstrate native-reset behavior for each existing control used. An application-uncontrolled Salt component is not necessarily an uncontrolled native input: the current `Input` writes its internally managed value to the native element, and the current state helper does not implement form reset or updated-default adoption. A function-valued Action does not establish reset support for those controls. [Salt Input][salt-input] and [controlled state][salt-controlled]. The complete reset and custom-selector contract belongs to RFC 002.

**Remote `ComboBox`.** Keep the controlled editing text responsive and update it synchronously. Separate the query, selected entity, response data, and pending/error presentation. Demonstrate an older response arriving after a newer response and a selected item missing from the current results. Apply request cancellation or stale-response guards in application code. [React input guidance][react-input] requires synchronous controlled input updates; [`useDeferredValue`][react-deferred] can defer result rendering but does not itself debounce requests.

These examples must be explicitly labeled for React 19 and kept outside the common React 16-compatible component implementation. They supplement an ordinary callback-based integration example so applications can adopt the pattern on their own schedule.

### Gate for any future Action prop

Before publishing one, demonstrate a recurring integration need that the recipes cannot adequately solve. Specify whether pending state blocks further activation, how errors are presented or propagated, how overlapping requests are ordered, and what happens after unmount. State updates after `await` must follow the supported React version's scheduling rules. A Transition is not a generic cancellation mechanism or a guarantee of latest-response-wins behavior.

An optional Action prop also needs an explicit React-version capability boundary. Feature detection must not silently provide weaker semantics on older React versions. A separate integration surface may be more honest than pretending one core prop has identical behavior everywhere.

## 6. Typed composition and predictable merging

Retain Salt's existing `render` model and semantically appropriate default elements. The current guide already requires custom components to forward refs and spread received props; improve the types and examples around that contract. [Salt render guide][salt-render-guide].

Prototype a component-specific render callback type on one existing composition use case, such as a routing link. The type should describe the actual props and ref supplied to the callback. Expose a small component state object only when it makes useful customization possible; do not publish internal hook state wholesale.

Verify both JSX-element and callback forms for classes, CSS custom properties, styles, children, DOM attributes, event order, ref attachment, and ref cleanup. Include an override that changes behavior, such as the final link target, so visual affordances follow the element actually rendered. Callback rendering remains responsible for applying the provided props.

Ref merging needs its own explicit test. `mergeProps` is not a general ref-composition utility. Reuse `useForkRef`/`forkRef` where required, and preserve React 19 cleanup support while remaining compatible with older React versions. Do not claim that every current render path composes every ref until the fixture proves it.

Tightening an `any` callback can reject source code that currently compiles. Assess that as a type-compatibility change, even when runtime behavior is identical. An additive typed helper or new surface can establish the contract before changing existing exported types. Avoid universal polymorphic generics that make ordinary use harder to understand.

## 7. Event details and cancellation

A reason is useful when it changes application behavior, for example distinguishing a dialog close button from outside dismissal, or a selection commit from text editing. It is not a reason to standardize every callback across the catalog.

Inventory the existing signatures first. In particular, list controls already use their second open-change argument for a reason string. Replacing that argument with an object would change the public contract. The initial prototype should be internal or explicitly opt-in; choose the public extension only after compatibility review.

If metadata is justified, define a small component-specific set of reasons, the originating event when one exists, and any relevant trigger or item identity. Programmatic changes and cleanup may have no originating DOM event. Do not fabricate an event. Review each reason and its meaning as part of Salt's public contract before publication.

Distinguish three operations: preventing a browser default, preventing Salt's proposed state change, and stopping propagation to another popup. They affect different things. Adding a cancellation method requires calling the handler before the cancellable work and specifying what is cancelled. That timing is a behavioral contract, not an incidental extra argument.

No generic `defaultPrevented` check or new event order should be introduced globally into `mergeProps` or `createChainedFunction`. Audit consumers and demonstrate the intended extension on one case first. Existing application-controlled state remains a valid way to reject a requested change.

## 8. Stable selection identity and SSR

Distinguish entity identity, React list keys, DOM IDs, display labels, editing text, and serialized form values. These can be related, but they serve different purposes. React explicitly reserves `useId` for generated associations rather than data/list identity. [React: `useId`][react-id].

Prototype the smallest explicit identity mechanism for object-valued choices. Before choosing a name such as a key extractor or equality comparator, demonstrate refreshed objects representing the same entity, duplicate labels, filtering, disabled items, and options that unmount while their selection remains. Define the policy for an entity that is genuinely removed rather than merely absent from the current result page.

Preserve existing reference-equality behavior for applications that do not adopt the new contract. Identity must not silently become a label comparison or a generic JSON comparison. Selected metadata must survive the supported filtering/virtualization lifecycle. A full virtualized collection API is not an implied first deliverable.

Align this investigation with RFC 002's identity and serialization contract so that the same selected entity has consistent interaction and submission behavior. One identity mechanism should serve both where practical.

For SSR, distinguish a DOM association that exists in server markup from one repaired after hydration. Test supplied IDs, generated IDs on supported React versions, and hydration with matching initial data. Preserve the legacy React fallback's documented limits; do not claim a React 18 guarantee for a React 16 path. Multi-root prefixes and duplicated runtime copies belong to RFC 003.

## 9. Lifecycle and Compiler compatibility

Add one bounded React 19 consumer fixture with compiled and uncompiled application components consuming the same Salt package output. Its purpose is to expose assumptions about render frequency, unstable identities, callback freshness, mutation, registration, and effect/ref cleanup. It does not authorize enabling the Compiler throughout Salt or removing existing memoization.

Use representative controlled selection, a composed trigger, and a nested popup. Exercise unrelated parent rerenders, rapid state changes, Strict Mode, interrupted work where reproducible, and unmount/remount. Compare observable values, callbacks, focus, ARIA, and cleanup rather than render counts alone. A passing fixture establishes coverage of those cases, not universal Compiler certification.

React's purity rules require side effects outside render and prohibit mutation of nonlocal values during rendering. The Compiler relies on these rules and supports incremental adoption. [React purity][react-purity] and [Compiler introduction][react-compiler]. Review proven violations when the fixture finds them; an architectural rewrite is not a prerequisite.

## 10. Delivery and acceptance gates

The slices below are proposals for implementation PRs. Approving this RFC authorizes the initial investigation and contract direction; public API decisions remain reviewable at their respective gates.

| Slice                       | Deliverable                                                                                                                           | Acceptance gate                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Popup contracts          | Small shared harness, documented family differences, initial nested/controlled/focus cases, and isolated fixes for confirmed defects. | Existing supported behavior remains covered; every changed expectation has an explicit rationale. Browser and React coverage is stated accurately.      |
| 2. React recipes            | Save, native form Action, and remote `ComboBox` examples using current APIs.                                                          | Pending, failure, retry, duplicate requests, reset, stale responses, and focus are exercised; examples state their React requirement.                   |
| 3. Lifecycle fixture        | Compiled/uncompiled React 19 consumer cases, with lifecycle observations.                                                             | Equivalent user-visible behavior in the covered cases; no change to the common React support floor.                                                     |
| 4. Identity and forms pilot | One object-valued selection case shared with RFC 002.                                                                                 | Stable selection after data refresh; explicit absent/removed-item policy; compatible legacy behavior and deterministic submission for the new contract. |
| 5. Typed composition        | One focused render-typing and ref/event-composition prototype.                                                                        | Useful inference, compatible supported usage, explicit merge rules, and React 16–19 ref/type checks appropriate to the change.                          |
| 6. Conditional metadata     | One application-backed reason/cancellation case, if the earlier work demonstrates a gap.                                              | Existing argument meanings preserved; timing and cancellation tested; public names and versioning reviewed before release.                              |

Slices 1–3 can proceed independently. Slice 4 coordinates with the form prototype. Slice 5 can start once the current merge contract is recorded. Slice 6 is conditional and can be deferred without blocking the other work.

This documentation branch does not claim those tests have run. Implementation PRs should report the commands, React versions, browsers, and manual accessibility checks actually exercised. Use the established React 16–19 and cross-browser infrastructure, with focused manual keyboard and assistive-technology review where an automated assertion cannot establish the contract. Automated accessibility checks alone are insufficient evidence of popup usability.

## 11. Alternatives and risks

**Rebuild Salt's interaction architecture.** This would combine behavior, styling, support-floor, and migration decisions into a larger program. The identified improvements can be tested and delivered through focused changes to the existing architecture.

**Publish a uniform metadata or Action API immediately.** Uniform names are attractive, but callback timing and async ownership differ by component. Prove one application need and its compatibility boundary first.

**Document existing differences and stop there.** Documentation helps, but does not prevent future regressions across composed popups, controlled timing, and cleanup. Shared assertions provide durable evidence.

The main risks are an overgeneralized harness, hidden behavior changes in shared utilities, excessive public types, and async examples that appear correct only on the happy path. The staged approach keeps each risk observable: component-specific adapters, compatibility fixtures, a narrow type prototype, and failure/ordering scenarios.

## 12. Open decisions for the team

1. Which two popup compositions should establish the first shared contract: dialog with menu, and dialog with selection popup are the recommended starting cases.
2. What fallback focus policy should Salt provide when the original trigger is removed, and what must the application specify?
3. Which application needs richer change reasons today, and can controlled state already satisfy it?
4. Should object identity be expressed by stable keys, a comparator, or a new selection surface? Resolve this jointly with RFC 002.
5. Which existing render use case best proves useful types without a catalog-wide polymorphism change?
6. What evidence would justify a Salt-owned Action prop beyond the application recipes?

## References

Salt source links are pinned to the assessed baseline. External primary documentation was checked on November 6, 2026; examples must still be validated against the exact React version used when implemented.

[salt-contributing]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/CONTRIBUTING.md
[salt-floating]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useFloatingUI/useFloatingUI.tsx
[salt-dialog]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/dialog/Dialog.tsx
[salt-menu]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/menu/MenuBase.tsx
[salt-overlay]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/overlay/Overlay.tsx
[salt-list]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/list-control/ListControlState.ts
[salt-controlled]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useControlled.ts
[salt-render]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/renderProps.tsx
[salt-merge]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/mergeProps.ts
[salt-refs]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/forkRef.ts
[salt-ids]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useId.ts
[salt-button]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/button/Button.tsx
[salt-input]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/input/Input.tsx
[salt-render-guide]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/getting-started/render-prop.mdx
[react-transition]: https://react.dev/reference/react/useTransition
[react-form]: https://react.dev/reference/react-dom/components/form
[react-action-state]: https://react.dev/reference/react/useActionState
[react-input]: https://react.dev/reference/react-dom/components/input
[react-deferred]: https://react.dev/reference/react/useDeferredValue
[react-id]: https://react.dev/reference/react/useId
[react-purity]: https://react.dev/reference/rules/components-and-hooks-must-be-pure
[react-compiler]: https://react.dev/learn/react-compiler/introduction
