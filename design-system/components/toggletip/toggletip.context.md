# Toggletip (Copilot Context)

Click-activated supplementary info pattern with a persistent panel until dismissed.

- API: ./toggletip.json
- Guidance: ./toggletip.md

## Key rules
- Always compose `Toggletip` with `ToggletipTrigger` and `ToggletipPanel`
- Use for supplemental context near non-interactive labels/metrics, not for critical required content
- Ensure trigger has a meaningful accessible name (`aria-label` or `aria-labelledby`)
- Keep content concise; avoid complex workflows that should use `Dialog`
- Choose placement to avoid obscuring primary content

## Example
```tsx
import { Toggletip, ToggletipTrigger, ToggletipPanel } from "@salt-ds/core";

<Toggletip placement="right">
	<ToggletipTrigger aria-label="More info about active users">
		i
	</ToggletipTrigger>
	<ToggletipPanel>
		Users who logged in at least once in the past 7 days.
	</ToggletipPanel>
</Toggletip>
```
