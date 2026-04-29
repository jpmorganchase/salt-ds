# Banner (Copilot Context)

Shows an in-context notification related to the user’s current task or workflow.

- API: ./banner.json
- Guidance: ./banner.md

## Key rules
- Use Banner for current-workflow notifications; use Toast for peripheral or low-priority events
- Place Banner below navigation in the main content area or related container
- Use `status` to express intent: `info` (default), `warning`, `error`, `success`
- Use `variant="secondary"` only when additional visual emphasis is needed
- Use `BannerActions` for dismiss/resolve/refresh actions
- For accessibility, use `role="alert"` for alerts and `role="status"` for notifications
- Tab moves focus through interactive elements

## Example
```tsx
import { Banner, BannerContent, BannerActions } from "@salt-ds/core";

<Banner status="warning" variant="primary" role="status">
  <BannerContent>
    Your session will expire soon.
  </BannerContent>
  <BannerActions>
    <Button appearance="transparent">Extend session</Button>
  </BannerActions>
</Banner>
```
