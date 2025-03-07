---
"@salt-ds/lab": minor
---

Added a new `reset` action that sets the first step as active and all others as pending. This action is useful when the user has completed the current flow and wants to start over.

Fixed a bug where the `ended` boolean was not updated correctly when all steps were completed. This issue was caused by an immutability problem in the state handling logic. The bug is now resolved, and the `ended` displays correctly.

Changed the `warning`, `error` and `clear` actions to to `status/warning`, `status/error` and `status/clear` respectively. This change was made to streamline the naming convention of the actions.

Removed `key` as identifier of StepRecord. This change was made to avoid confusion with the `key` attribute in React components and streamline search of a step. The `id` attribute should be used instead.

Before:

```tsx
export type StepRecord =
  | (Omit<StepProps, "children"> & { key: string })
  | (Omit<StepProps, "children"> & { id: string });
```

After:

```tsx
export type StepRecord = Omit<StepProps, "children"> & { id: string };
```

We recommend passing down `id` and `key` for optimal results, although you could just provide `key`. Please refer to the examples provided for further clarification.

Recommended approach, pass `id` as both `id` and `key`:

```tsx
<SteppedTracker>
  {state.steps.map((step) => (
    <Step key={step.id} {...step} />
  ))}
</SteppedTracker>
```

Pass `id` as `key` only:

```tsx
<SteppedTracker>
  {state.steps.map(({ id, ...step }) => (
    <Step key={id} {...step} />
  ))}
</SteppedTracker>
```
