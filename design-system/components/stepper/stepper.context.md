# Stepper (Copilot Context)

Displays ordered process steps with optional nested substeps.

- API: ./stepper.json
- Guidance: ./stepper.md

## Key rules
- Import and use both `Stepper` and `Step` from `@salt-ds/core`
- Use `orientation="horizontal"` by default; use `vertical` when nested steps are needed
- Nested `Step` children are supported only in vertical steppers
- Use `stage` for progression, and `status` (`warning`/`error`) only when overriding visual state
- Add contextual `aria-label` on `Stepper` for assistive users
- Do not use Stepper as site/page navigation

## Example
```tsx
import { Stepper, Step } from "@salt-ds/core";

<Stepper orientation="vertical" aria-label="Onboarding steps">
	<Step label="Account" stage="completed" />
	<Step label="Verification" stage="active">
		<Step label="Email" stage="completed" />
		<Step label="Phone" stage="inprogress" />
	</Step>
	<Step label="Finish" stage="pending" />
</Stepper>
```
