# RFC 002: Native form integration

| Item                 | Value                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status               | Draft for team discussion; proposed decisions are not approved APIs                                                                              |
| Date                 | November 6, 2026                                                                                                                                 |
| Source baseline      | [`3bd9580d2a09e9bc0415efd30469f211256fe08f`](https://github.com/jpmorganchase/salt-ds/tree/3bd9580d2a09e9bc0415efd30469f211256fe08f)             |
| Decision requested   | Agree the target form contract, compatibility boundaries, and first two implementation slices                                                    |
| First implementation | Characterize existing form behavior and add `Switch.inputRef`; then prototype a native field and a custom single-select field                    |
| Related RFCs         | [Component contracts and React](./001-component-contracts-and-react.md), [Theme and runtime integration](./003-theme-and-runtime-integration.md) |

## Summary

Salt should make ordinary HTML forms a reliable integration surface across its controls. A field should submit the intended values, expose an accessible interaction surface, and behave predictably when validated, reset, disabled, made read-only, or changed by the browser.

Keep the native elements that already underpin Salt. Give richer selectors an explicit form contract and evaluate a native companion where appropriate. An `<input type="hidden">` can contribute a submitted value, but does not provide constraint validation, visible invalid focus, or a complete reset lifecycle. Adding one everywhere would leave much of the problem unresolved. [HTML input states][html-input]

Deliver the improvements incrementally. Add independent capabilities to existing controls when their supported behavior is preserved. Introduce changes to value meaning, submitted entries, required blocking, reset, refs, or event routing through an explicit local adoption boundary. Public names and the companion implementation remain prototype decisions.

Two acceptance examples express the benefit:

- A required multiselect with two selected desks submits two desk IDs and is valid while its search input is empty.
- An empty read-only reference can display an em dash while submitting an empty reference value.

The team is being asked to endorse this direction and begin bounded implementation, not approve every API sketch or a catalog-wide rebuild.

## 1. Motivation and assessed behavior

These findings describe the pinned source revision. They are source observations, not a claim that a new cross-browser conformance suite has already passed. Runtime reset behavior in particular needs characterization before changes are proposed.

| Area                                                                          | Assessed behavior                                                                                                                                          | Integration consequence                                                                                    |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Input][salt-input] and [MultilineInput][salt-multiline]                      | Native editing elements sit inside wrappers, with separate native-prop and ref routes.                                                                     | Consumers need to know which element receives a prop, handler, or ref.                                     |
| [Checkbox][salt-checkbox] and [RadioButton][salt-radio]                       | Native inputs sit inside labels; some input-shaped top-level attributes reach the label rather than the input.                                             | Type acceptance alone does not establish native-control forwarding.                                        |
| [Switch][salt-switch]                                                         | Uses a native checkbox with switch semantics; the primary ref targets its label and there is no `inputRef`.                                                | Native focus and form-library registration lack the corresponding explicit access route.                   |
| [Dropdown][salt-dropdown]                                                     | The trigger is a button; selection lives in React state and requiredness is expressed through ARIA.                                                        | Committed selections do not become ordinary selection entries in `FormData`.                               |
| [ComboBox][salt-combobox] and its [state hook][salt-combobox-state]           | The native input holds display/query text; selecting one item writes its label and multiselect clears the query.                                           | Named input text and native text requiredness do not describe committed selections.                        |
| [FormFieldLabel][salt-label]                                                  | Locates an associated descendant and calls `focus()` and `click()`.                                                                                        | Native label association is reproduced in JavaScript; adding `htmlFor` also requires an activation review. |
| [CheckboxGroup][salt-checkbox-group] and [RadioButtonGroup][salt-radio-group] | Render fieldsets but distribute disabled state through Salt context.                                                                                       | Native descendants outside that context do not inherit a native disabled fieldset.                         |
| Empty read-only inputs                                                        | [Input][salt-input] can put the display marker in the native value.                                                                                        | A named empty field can submit presentation text.                                                          |
| State and reset                                                               | [`useControlled`][salt-controlled] has no shared form-reset lifecycle and treats changing defaults as unsupported.                                         | Native reset, React state, and displayed values need coordinated investigation.                            |
| Formatted values and files                                                    | [NumberInput][salt-number] and [date inputs][salt-date] expose formatted text; [FileDropZoneTrigger][salt-files] clears the file input after its callback. | Canonical values and persistent file submission need explicit contracts.                                   |

Existing native controls remain useful. The problem is consistency across the lifecycle, not an absence of native elements. Validation styling and required markers also need an audit against actual native constraints and accessible state; a visible error should not be assumed to establish `aria-invalid` on the interactive element.

## 2. Scope and compatibility policy

This RFC covers form participation, semantic values, submission, defaults/reset, validation, labels/descriptions/errors, focus and refs, event routing, server rendering, form-library integration, React Actions, browser-originated changes, and migration.

Applications retain business schemas, cross-field and server rules, network requests, persistence, field arrays, wizard navigation, and retention of unmounted-step values. Salt does not introduce a mandatory whole-form values store or schema engine. Replacing Salt with another library, changing its visual language, replacing date adapters, and raising React/browser minimums are outside this proposal.

Compatibility includes observable behavior as well as TypeScript: payloads, validation blocking, defaults/reset, callback arguments and order, `currentTarget`, ref targets, focus, accessible associations, and documented styling hooks. Adding a native element can change a payload without removing a prop. Native requiredness can block a previously accepted submission.

The release policy is:

1. Add optional capabilities such as `Switch.inputRef` where existing valid usage is preserved. Continue using and documenting existing `inputProps`, `textAreaProps`, `inputRef`, and `textAreaRef` routes.
2. Assess corrective fixes against existing promises and consumer impact. An accidental limitation need not become permanent, but an observable change needs evidence and release communication.
3. Use a new surface when several contracts change together. Dropdown and ComboBox are strong candidates. Next-style exports or a separate entry point are options; exact names remain open.
4. Keep adoption visible at the field or screen. An optional Form/provider must not reinterpret legacy descendants automatically.
5. Keep experiments private until the contract is reviewed. A supported Next export still needs a stability policy.
6. Reuse compatible styles and internals after proving them across a native control and a custom selector. Do not change legacy `useControlled` globally to install new reset behavior.

No legacy removal date is proposed. Later consolidation requires adoption evidence and an approved migration boundary.

## 3. Architecture and native participation

### Responsibilities

| Layer                       | Owns                                                                                                   | Integration promise                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Control                     | Editing/selection, native element or companion, serialized entries, control validity, and reset state. | Works inside a plain HTML form.                                          |
| Field                       | Label, description, error associations, validation presentation, and visible focus targets.            | Supports Salt controls and an explicit native-control integration path.  |
| Optional Form               | Error mapping, form-level presentation, optional summary, and focus coordination.                      | Renders a real form and preserves native props, actions, and submitters. |
| Application or form library | Domain state and rules, controlled values, submission, and persistence.                                | Remains authoritative without a second Salt value store.                 |

A field instance has identity separate from its submission name: repeated names are legitimate. Composite fields can have multiple visible targets. Registration supports coordination but must not become the only route through which a value reaches `FormData`.

### Choose the native mechanism per control

Keep native interaction inputs for text, textarea, checkbox, radio, switch, and suitable range controls. Offer a real native select for bounded simple choices. For rich Dropdown behavior, first prototype a visually hidden native select where the collection/value model fits. Evaluate another strategy when remote or virtualized collections make full option mirroring unsuitable.

A selection-only ComboBox keeps its visible text input for editing and accessibility while representing committed selection separately. Free-text autocomplete is a different contract. A hidden input is appropriate for serialization alone; it must not be described as a validation proxy. A visually hidden select or text input has different focus and validation behavior. [HTML input states][html-input]

[React Aria's HiddenSelect][aria-hidden-select] and [Base UI's forms guidance][base-forms] offer implementation references. They are evidence for techniques to investigate, not a dependency or a substitute for Salt's own browser and assistive-technology testing.

Every companion must satisfy these invariants:

- Stay mounted independently of popup visibility; do not submit a logical value twice.
- Carry the correct name, form owner, and effective disabled state.
- Avoid a duplicate accessible control and unwanted tab stop; invalid focus reaches the visible interaction surface.
- Reflect the documented committed value at the documented submission boundary; an effect-only synchronization mechanism is insufficient for immediate reads.
- Reconcile browser-originated changes and emit one documented logical update where event forwarding is required.
- Sit beside the trigger within the component wrapper, rather than nesting another interactive input/select inside a button.
- Keep validation eligibility intentional. Do not apply `readOnly` merely to silence a React warning on a validating text proxy.

### Form ownership and browser changes

Use the participating element's actual form owner, including explicit `form` association. Test external ownership and owner changes rather than relying on React ancestry or a closest-form query. A `form` attribute on a fieldset does not assign that owner to its descendants. [HTML form ownership][html-infrastructure]

Keep companions outside popup portals where practical. If the entire field is portalled, external ownership must remain explicit. Reset listeners must follow the current owner through changes, mounting, and unmounting.

Treat autofill and restoration as incoming values. Define how they map to semantic identifiers, notify controlled owners, and handle an option that has not loaded. Duplicate labels must not cause ambiguous matching. Do not overwrite an uncontrolled browser-restored value during hydration simply because initial React state is stale. Advertise autofill/password-manager/restoration support only for demonstrated capabilities.

## 4. Values and serialization

The new contract separates four representations:

| Representation   | Example                                           |
| ---------------- | ------------------------------------------------- |
| Domain value     | An account object with stable identity `acct-42`. |
| Editing text     | `acm` while searching.                            |
| Display label    | `Acme Treasury in GBP`.                           |
| Serialized value | `acct-42`.                                        |

A display conversion function is not automatically a serializer. Preserve legacy `valueToString` meaning. Object-valued fields need explicit stable identity and deterministic serialization; duplicate labels are valid, but distinct selectable options need unique, stable transport identifiers. Do not silently submit `[object Object]` or invent a JSON transport format. Preserve selected identifiers across filtering, virtualization, and temporarily unloaded options.

### Proposed entry rules for the new contract

| Field                 | Entries                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Text/multiline        | One named string, including an intentional empty string.                                                                |
| Single choice         | One stable string; an unselected field submits an explicit empty value. Reserve empty-string option IDs for that state. |
| Multiple choice       | Repeated entries under the same name; no selection produces no entries.                                                 |
| Checkbox/switch       | Checked value when checked; no automatic hidden false entry.                                                            |
| Radio group           | Selected eligible value under its explicit group name.                                                                  |
| Range/date range      | Explicitly named endpoints.                                                                                             |
| Formatted number      | Canonical decimal for a valid value; intentional optional emptiness is distinct from an invalid draft.                  |
| Date-only field       | Calendar value such as `YYYY-MM-DD`, independent of presentation.                                                       |
| Persistent file field | Actual `File` entries under the documented single/multiple and empty-file policy.                                       |

For ordinary unordered multiselects, start with logical collection order, not click order. Ordered token/ranking fields need a separate contract. Async collections need a deterministic retained ordering policy before publication. Use `FormData.getAll()` for repeated entries; `Object.fromEntries()` alone loses that multiplicity.

Follow native omission rules for disabled controls and unchecked choices. A nonempty submission name is required to contribute entries, but unnamed controls may still require validation. [HTML entry construction][html-infrastructure]

New form-participating radio groups require an explicit nonempty resolved name. Preserve the legacy generated-name behavior until migration. Any unnamed mode needs its own grouping/validation policy; native radio grouping depends on a shared name and form/tree context. [HTML radio inputs][html-input]

### Selection changes and unavailable items

Separate temporary filtering/virtualization, unresolved remote data, disabled-for-new-selection items, and authoritative removal from the domain. Choose whether an unavailable committed selection is retained, omitted, cleared, or invalidated before publishing that capability. Do not let the companion's native disabled-option behavior silently choose the policy.

For single selection-only ComboBox, prototype clearing selection when its display text is edited. Retention is acceptable only if the UI clearly distinguishes the committed selection from the query. Never silently submit an old ID as though the replacement text had been accepted. In multiselect, editing the query does not remove selected pills. Submit query text only when explicitly requested. Free-text/token creation needs a distinct contract.

### Invalid drafts and presentation

Invalid number/date drafts must remain available to the application and block native interactive submission. They must not silently submit an older valid value. Direct `FormData` construction does not validate, so the draft's payload is a separate publication gate: evaluate an explicit raw-draft protocol or a canonical-value protocol that also represents invalidity. Treating a malformed optional value as an ordinary empty string can turn an invalid edit into an unintended clear. [HTML submission and constraints][html-infrastructure]

Do not migrate existing formatted controls before that protocol is resolved. Preserve a precise-value path for monetary editing; do not require lossy floating-point conversion. Date-only serialization must not introduce a UTC conversion that changes the calendar date. Read-only markers, adornments, and formatted labels remain presentation, never replacements for the semantic value.

## 5. Controlled state, defaults, and reset

Controlled values remain application-owned throughout the component's lifetime. A proposed selection in a callback is not an accepted controlled value. Before publication, specify what immediate `FormData` reads or imperative submission inside that callback observe, and test both accepted and rejected updates. Consumers requiring the accepted result submit after its documented commit point.

Keep native input updates synchronous where they control the input. Avoid switching controlled/uncontrolled ownership during a component's lifetime. [React input reference][react-input]

| Situation          | Target contract                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Uncontrolled reset | Native entries, visible state, and semantic state return to the documented defaults.                    |
| Controlled reset   | Supplied state remains authoritative; the application updates it through its documented reset path.     |
| Canceled reset     | Neither native nor Salt-owned values are reset.                                                         |
| Updated defaults   | Current documented defaults become the reset baseline without overwriting a dirty active edit.          |
| Selector reset     | Selection, displayed labels, and entries agree; close the popup and restore its documented query state. |
| Owner change       | Reset follows the actual current form owner.                                                            |

Reset is not an ordinary user change. Do not fabricate an input/change callback; add a distinct reset signal only if a demonstrated integration needs one. Handle cancellation after all relevant listeners can act. Deferred handling must respect React 16 synthetic-event lifetime. Test both immediate payload observations where meaningful and rendered state after React commits; controlled companions must not temporarily publish conflicting reset values.

Client interaction metadata, client errors, and externally supplied server errors have different owners. Manual reset can clear locally owned presentation according to policy; external errors remain application-controlled. A native reset event does not identify whether React Action handling, application code, or a button caused it. Reason-specific behavior needs explicit integration state, not assumptions about React internals.

## 6. Associations, validation, and focus

### Labels and server rendering

Use native label association for a single labelable control. Use fieldset/legend where they describe a group, while retaining individual choice labels. Composite fields explicitly identify their focus targets. Do not keep the existing manual `focus()`/`click()` activation unchanged when adding `htmlFor`: that can activate twice.

Descriptions and errors are separate parts. Compose and deduplicate caller IDs with Salt IDs, avoid references to absent parts, and associate text with the actual interaction target or relevant group. Displayed invalidity should produce the corresponding accessible state; warnings do not automatically imply invalidity. Begin with a tested `aria-describedby` strategy and assess `aria-errormessage` against actual supported assistive technology.

Initial server HTML needs a declarative association path, including through wrappers and extracted components. Client registration can supplement it but cannot create a promised pre-hydration association. [Salt's ID helper][salt-id] uses React `useId` where available and an effect-generated React 16/17 fallback. Therefore:

- React 18+: provide an automatic SSR-compatible ID path and matching hydration structure.
- React 16/17 SSR: provide explicit stable caller IDs unless a separate automatic mechanism is proven.
- All versions: preserve documented caller-ID precedence; test initial HTML and hydrated DOM separately.

Independent React roots need distinct root prefixes or explicit IDs; server and hydration prefixes must agree. See [React's ID guidance][react-id] and the [runtime RFC](./003-theme-and-runtime-integration.md). A custom widget's companion does not make its custom interaction work before JavaScript; progressive-enhancement claims must distinguish initial values from usable interaction.

### Validation ownership and timing

Separate constraints, actual validity, error visibility, and submission blocking. Field markers and control requiredness need one precedence policy; contradictory declarations should receive useful development feedback. Preserve legacy precedence.

For the new contract, use native constraints plus Salt's accessible presentation where Field is present. External validation mode delegates results/timing to the application or form library. It cannot erase intrinsic native constraints with a field-local flag; externally managed submission generally needs a deliberate form-level `noValidate` policy. Preserve native input types and honor submitter `formNoValidate`. Clear Salt-owned custom validity when ownership ends. [HTML constraints][html-infrastructure]

Requiredness applies to the logical field: a required checkbox must be checked; a required multiselect needs a committed selection; an “at least one” checkbox-group rule is not implemented by requiring every child. Rich selection/number/date constraints need semantic validation where native text constraints are insufficient.

Proposed timing:

1. Keep validity current before the browser's submission-validation step.
2. Reveal errors on attempted submission by default.
3. Once revealed, update errors as the user corrects the field.
4. Offer blur-based presentation when needed; external libraries can supply their own interaction metadata.

### Useful feedback without a mandatory Form

Fields work under a plain `<form>`. Native controls can retain browser feedback when used without Field. A custom standalone control must not advertise native validation until it provides useful visible focus and an accessible explanation without Salt Form.

Do not focus unconditionally from every `invalid` handler: both explicit checks and interactive reporting can dispatch invalid events, and several fields may fail. The prototype must preserve non-interactive `checkValidity()` behavior and provide coherent first-invalid focus for interactive submission/reporting. Two invalid fields in a plain form are a required test, not an optional integration enhancement.

An error summary can navigate to a visible target and invoke an application reveal step for collapsed sections. Follow meaningful form-control order, rather than assuming registration order matches it. Unmounted wizard fields remain the application's workflow responsibility.

Server errors need an explicit repeated-name/group mapping policy and should be tied to the submitted value or revision. Suppress or clear stale errors through documented rules; a late response must not replace a newer value's result. Salt supplies presentation/integration rather than a general asynchronous validation scheduler. [React Aria's form integration][aria-forms] is a useful reference.

### Disabled and read-only

Disabled interaction and native participants must agree, including mixed native descendants of fieldsets, the first-legend exception, and popups portalled outside a disabled ancestor. Read-only fields preserve their values and documented focus/copy/review behavior.

Checkboxes, radios, and selects lack native text-style read-only behavior. Salt must explicitly prevent changes, retain submitted values, communicate state, and define validation eligibility. Disabling a companion removes its entry and is not a general read-only solution. The intended policy avoids blocking on a non-editable field; the mechanism and stale-custom-validity cleanup are publication gates. [HTML input states][html-input]

## 7. React, native submission, and external libraries

Preserve ordinary form submission, explicit submit/reset buttons, external ownership, submitter name/value, alternate actions, and `formNoValidate`. Keep [Button's][salt-button] current default `type="button"`. Test loading behavior with Enter submission and alternate submitters as well as pointer activation.

A plain `new FormData(form)` snapshot does not automatically retain the activated submit button. Recipes must preserve the actual submitter through a method supported by the existing browser floor. Do not silently require a newer programmatic submission API.

React 19 function-valued actions consume `FormData` and reset uncontrolled fields on normal completion, including returned validation errors. The integration must preserve values/defaults and externally owned errors deliberately. Mandatory scenario: submit, return errors, keep entered values, correct them, and resubmit. [React form reference][react-form]

An optional Salt Form must preserve `action`/`formAction`, avoid unconditional `preventDefault()`, and retain server-action/progressive-enhancement behavior where applicable. Shared code continues to support React 16.14+. React 19-only helpers need an explicit boundary. Ordinary input/selection callbacks remain immediate; an Action suffix is not a rename for `onChange`. The broader Action policy belongs in [RFC 001](./001-component-contracts-and-react.md).

Supply one maintained external-library recipe, initially React Hook Form or another agreed representative. Native controls expose registration/focus access; rich controls expose controlled value, blur, focus, and error integration. Avoid putting fake domain values into synthetic native events. The external library owns its values and validation, with repeated values and files handled explicitly.

## 8. Component adoption and migration

| Family                                 | Direction and additional gate                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input/MultilineInput                   | Native props and focus access; preserve IME, caret, constraints, reset, and empty read-only behavior. Allow genuinely uncontrolled rendering where practical. |
| Checkbox/RadioButton/Switch and groups | Native inputs, explicit grouping, checkedness/reset, native focus access, mixed-descendant disabled behavior.                                                 |
| Dropdown/ComboBox                      | Explicit identity, query/selection, serialization, companion, validity, reset, and controlled commit boundary.                                                |
| ListBox                                | Form participation is explicit; retain useful non-form selection behavior.                                                                                    |
| Slider/RangeSlider                     | Names/endpoints, native refs, disabled state, and reset.                                                                                                      |
| Number/date controls                   | Canonical transport, precise editing, invalid drafts, date/timezone distinctions, and range endpoints.                                                        |
| File controls                          | Distinguish repeated picker/upload workflows from persistent form file fields.                                                                                |
| NativeSelect                           | Useful native fallback; modern select styling/markup is a separate enhancement gate.                                                                          |

FileDropZoneTrigger keeps its existing picker semantics. A persistent file field must handle actual files, dropped files, repeated selection, clearing, multiple files, and reset. A string companion cannot carry file contents. Document native empty-file entries; a controlled `File[]` cannot be treated like a controlled text value. Any native `FileList` synchronization needs its own browser evidence. [HTML file input][html-input]

Adopt a complete logical field, including label, description, and errors. Legacy fields/controls stay supported together; new Field/new controls and an explicit native-control path are supported under the new contract. Cross-wrapping old and new families requires a tested adapter, not accidental shared context. Coexistence in the same form does not imply every wrapper combination is supported.

For each migration, document payload changes and remove only replaced workarounds; check duplicate hidden fields, value/query callbacks, refs, validation ownership, defaults/reset, server errors, styling, and keyboard behavior. Mechanical codemods may help, but must report semantic choices such as label-versus-ID submission rather than guessing. Backend contracts need coordinated application migration. Keep adoption small enough to restore the legacy field and its integration code if needed.

## 9. Implementation slices and acceptance

### PR1: Existing form integration and native Switch access

Create a real form fixture with Input, Checkbox, Switch, and Button. Characterize supported payload, ref, event, label, and reset behavior; record limitations separately from new target expectations. Add optional `Switch.inputRef` while retaining its label ref, and document existing native-prop routes.

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<Switch label="Email notifications" inputRef={inputRef} />;
```

This is a proposed additive API. **Exit:** useful native access and evidence that existing valid usage retains its supported behavior. No broad reset/serialization changes.

### PR2: Private native-field and Dropdown prototype

Prototype associations/error presentation around a native input and form participation for a custom single-select. Use plain forms, external ownership, native submit/reset, and two invalid fields. Exercise requiredness, visible focus, cancellation, controlled acceptance/rejection, current defaults, and initial SSR/hydration paths.

**Exit:** the scoped native-field/single-select contract is coherent without Salt Form. Document companion tradeoffs and commit/reset boundaries. Keep the prototype outside supported exports.

### PR3: Multiselect and integration proof

Add selection-only multiselect ComboBox and an “at least one” checkbox-group case. Demonstrate repeated values/order, empty queries, server errors with React 19, an external form library, mixed legacy/native/new usage, and supported SSR paths.

**Exit:** the model works across native, grouped, single-, and multiple-selection fields without changing legacy descendants. Resolve the decisions required for the selected public capabilities.

### PR4: Limited supported adoption

Publish the smallest useful surface under an agreed stability policy. Supply migration examples, exact payload expectations, capability limitations, and one representative consumer form. Keep helpers private; expand optional Form only for demonstrated coordination needs.

**Exit:** consumers can adopt locally without a new form-state framework. All advertised ownership/default transitions, composition combinations, React/browser cases, and acceptance scenarios pass. Follow with formatted values, ranges, files, and NativeSelect as their individual gates are resolved.

## 10. Verification and operational constraints

Use real-browser form tests, supplemented by SSR/type checks and focused manual accessibility/autofill evidence. An accessibility scan or snapshot alone cannot establish the lifecycle contract.

| Area                          | Required evidence                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entries                       | Named/unnamed, empty, scalar/repeated values/order, unavailable selections, objects, checkedness, read-only, files, and submitter data.               |
| Ownership/state               | External and changed owners; controlled accepted/rejected updates; documented immediate reads; current defaults; canceled reset.                      |
| Validation                    | Logical requiredness, native/custom constraints, external mode, bypass submitters, disabled/read-only transitions, stale validity cleanup.            |
| Focus/editing                 | Single label activation, correct refs, first-invalid target, no companion tab stop, IME/caret, Enter selection versus submission, and partial drafts. |
| SSR                           | Initial associations and entries, explicit legacy IDs, wrappers, conditional parts, independent roots, and hydration.                                 |
| Integration                   | Plain form, external library, Action success and returned errors, mixed native/legacy/new fields, and reset ownership.                                |
| Accessibility/browser changes | Keyboard, representative screen-reader/browser combinations, zoom/reflow/forced colors, and specifically advertised autofill/restoration.             |

Retain the assessed [support floor][salt-platforms]: React 16.14+, Chrome 86+, Firefox 86+, Edge 85+, and Safari 15.4+. Test supported React majors and browser engines; current-engine CI does not prove an API exists in the minimum versions. Any modern native-select markup/styling needs a useful fallback and parser/hydration evidence. Do not switch an existing rich control's interaction engine by browser detection.

Avoid a form-wide values subscription that rerenders every sibling. Install mechanisms for actual capabilities, including validation of unnamed required fields. Large collections must not require an unbounded second option DOM. Measure representative rendering/interaction/DOM size; this RFC promises no numerical performance gain.

Before supported release, all included controls must identify their semantic value, entries, native participant, visible target, and validation owner. Plain-form submit/reset, logical requiredness, controlled/uncontrolled/canceled reset, returned-error value preservation, external-library integration, mixed adoption, declared SSR guarantees, and migration guidance are release requirements. Claims must match the evidence obtained.

## 11. Alternatives, risks, and decisions still open

| Alternative                                          | Assessment                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Hidden input behind every widget                     | Partial serialization only; leaves validation, reset, and focus unresolved and risks duplicate entries.    |
| Hidden select behind every widget                    | Useful for some choices; collection size, browser changes, read-only, and invalid focus still need design. |
| Replace rich controls with native select/date/number | Useful as additional options; does not preserve every specialized editing/selection requirement.           |
| Global switch or changed legacy defaults             | Makes payload and lifecycle adoption implicit across reused trees.                                         |
| Mandatory form-state/schema framework                | Competes with application state and broadens ownership.                                                    |
| Whole-library rewrite or replacement                 | Outside the agreed direction; delays independently useful changes.                                         |
| Form-associated custom elements                      | Possible separate research; not required to establish this React/native contract.                          |

Principal risks are changed/duplicate payloads, invisible invalid controls, native/controlled divergence, Action resets losing values/errors, unsupported SSR claims, and two long-lived APIs. Mitigate them through exact payload assertions, plain-form focus tests, explicit ownership, local migration, private prototypes, and capability-specific documentation.

| Open decision                              | Starting point                                                                | Gate                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| Public names/distribution                  | Visible local adoption; stable policy for any supported Next surface.         | Before PR4.                                      |
| Field composition/SSR                      | Declarative metadata/parts plus explicit associations.                        | PR2/PR3.                                         |
| Companion per selector                     | Native select where suitable; retained entries for large/remote data.         | Before advertising that capability.              |
| Controlled commit boundary                 | Only accepted controlled state is authoritative; specify callback-time reads. | Before selector publication.                     |
| Single ComboBox query edits                | Evaluate clearing selection; no silent stale-ID submission.                   | PR3.                                             |
| Disabled/removed selections                | Distinguish temporary absence from authoritative domain changes.              | Before each choice capability.                   |
| Object keys/labels/serializer and ordering | Separate responsibilities; logical collection order for ordinary sets.        | PR3/publication.                                 |
| Radio naming                               | Explicit nonempty resolved name; separate unnamed-mode policy if needed.      | Before new radio-group publication.              |
| Invalid formatted drafts                   | Preserve draft and validity; settle direct-snapshot protocol.                 | Before number/date migration.                    |
| Default updates/reset notification         | Current defaults; no fabricated user change; cancellation-aware handling.     | PR2/PR3.                                         |
| Standalone native feedback                 | Visible invalid focus and accessible explanation without mandatory Form.      | Before each advertised capability.               |
| Server-error invalidation                  | Submitted-value/revision association; external ownership.                     | PR3.                                             |
| Read-only without native support           | Preserve entries, prevent changes, define non-blocking validity policy.       | Before those controls migrate.                   |
| NativeSelect enhancement                   | Useful fallback with separate markup/styling evidence.                        | Separate prototype.                              |
| Legacy deprecation/removal                 | No date proposed.                                                             | Adoption evidence and approved migration policy. |

Open decisions do not block unrelated additive fixes. They do block publication of capabilities whose behavior depends on them.

## References

Current-state links are pinned to the assessed Salt revision. External references describe the platform or implementation techniques; the Salt policies above remain proposals.

- [HTML form control infrastructure][html-infrastructure] and [input states][html-input].
- [React input][react-input], [form Actions][react-form], and [IDs across roots and SSR][react-id].
- [Base UI forms][base-forms], [React Aria forms][aria-forms], and [HiddenSelect implementation][aria-hidden-select].

[salt-input]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/input/Input.tsx
[salt-multiline]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/multiline-input/MultilineInput.tsx
[salt-checkbox]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/checkbox/Checkbox.tsx
[salt-radio]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/radio-button/RadioButton.tsx
[salt-switch]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/switch/Switch.tsx
[salt-dropdown]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/dropdown/Dropdown.tsx
[salt-combobox]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/combo-box/ComboBox.tsx
[salt-combobox-state]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/combo-box/useComboBox.ts
[salt-label]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/form-field/FormFieldLabel.tsx
[salt-checkbox-group]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/checkbox/CheckboxGroup.tsx
[salt-radio-group]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/radio-button/RadioButtonGroup.tsx
[salt-controlled]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useControlled.ts
[salt-number]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/number-input/NumberInput.tsx
[salt-date]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/date-components/src/date-input/DateInputSingle.tsx
[salt-files]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/file-drop-zone/FileDropZoneTrigger.tsx
[salt-id]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/utils/useId.ts
[salt-button]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/packages/core/src/button/Button.tsx
[salt-platforms]: https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/about/supported-platforms.mdx
[html-infrastructure]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
[html-input]: https://html.spec.whatwg.org/multipage/input.html
[react-input]: https://react.dev/reference/react-dom/components/input
[react-form]: https://react.dev/reference/react-dom/components/form
[react-id]: https://react.dev/reference/react/useId
[base-forms]: https://base-ui.com/react/handbook/forms
[aria-forms]: https://react-aria.adobe.com/forms
[aria-hidden-select]: https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/select/HiddenSelect.tsx
