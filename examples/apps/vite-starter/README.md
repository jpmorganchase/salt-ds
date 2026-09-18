# Salt Vite starter

A small, standalone Vite application using Salt's current theme and provider.
It includes responsive navigation, a form, density and color-mode controls, a
dialog, and success feedback.

```sh
npm install
npm run dev
```

Run `npm run typecheck` and `npm run build` before shipping. This application
uses only published package entry points; it does not depend on Storybook,
repository aliases, or unreleased tooling.

Repository maintainers validate the complete release-candidate package cohort
from local package archives with `yarn check:sample-apps`. The commands above
are the ordinary consumer workflow for the matching published cohort.
