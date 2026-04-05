# @salt-ds/date-components

Salt Design System date components.

## Status

The date components previously lived in `@salt-ds/lab`. They now live here in `@salt-ds/date-components`.

To avoid a breaking change, `@salt-ds/lab` still re-exports these components for now (and logs a deprecation warning in development). New code should import from `@salt-ds/date-components`.

## Contents

This package includes:

- **Calendar** (and supporting hooks)
- **Date input** components
- **Date picker** components
- **LocalizationProvider** for date localization/config

## Installation

```sh
yarn add @salt-ds/date-components @salt-ds/date-adapters
```

You will also need the usual Salt peer dependencies (React) and the Salt packages used by these components (for example `@salt-ds/core`, `@salt-ds/styles`).

## Date adapters

The date components rely on `@salt-ds/date-adapters` for parsing/formatting and date framework integration.

Make sure you have an adapter configured for the date library/framework you’re using, and wrap your app (or the relevant subtree) with `LocalizationProvider`.

## Usage

Import components from `@salt-ds/date-components`:

```tsx
import {
  LocalizationProvider,
  DatePicker,
  DateInputSingle,
  Calendar,
} from "@salt-ds/date-components";

// ...render in your app
```

## Migration from `@salt-ds/lab`

If you currently import date components from `@salt-ds/lab`, you can continue to do so for now, but those exports are deprecated and will be removed in a future release.

Update imports from:

```ts
import { DatePicker } from "@salt-ds/lab";
```

to:

```ts
import { DatePicker } from "@salt-ds/date-components";
```
