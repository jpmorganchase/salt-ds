# Toast (Copilot Context)

Transient, non-blocking app notifications for peripheral workflow/system events.

- API: ./toast.json
- Guidance: ./toast.md

## Key rules
- Compose toast structure as `Toast` + `ToastContent`; include dismiss/action controls as needed
- Use status only when the message has explicit status semantics (`info`, `error`, `warning`, `success`)
- Keep content concise and scannable; avoid long paragraphs in constrained toast space
- Ensure any icon-only dismiss/action controls have accessible labels
- For multiple toasts, stack chronologically in a non-intrusive viewport location

## Example
```tsx
import { Toast, ToastContent } from "@salt-ds/core";

<Toast status="warning">
	<ToastContent>
		Your session will expire in 2 minutes.
	</ToastContent>
</Toast>
```
