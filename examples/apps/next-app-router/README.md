# Salt Next App Router starter

A standalone Next App Router application using `SaltProviderNext` and the
current Salt theme. The provider and interactive request dialog are narrow
client boundaries; the page content remains a Server Component.

```sh
npm install
npm run dev
```

Validate with `npm run typecheck` and `npm run build`. The source imports only
public package entry points and does not require Storybook, repository aliases,
or unreleased tooling.

Repository maintainers validate the complete release-candidate package cohort
from local package archives with `yarn check:sample-apps`. The commands above
are the ordinary consumer workflow for the matching published cohort.
