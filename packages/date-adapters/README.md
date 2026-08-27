# `@salt-ds/date-adapters`

Date-library adapters used by `@salt-ds/date-components` for parsing,
formatting, locale and timezone behavior.

## Install

Install the package and only the date library used by your application:

```sh
npm install @salt-ds/date-adapters date-fns
```

Supported entry points are `date-fns`, `date-fns-tz`, `dayjs`, `luxon` and
`moment`. Their matching peer dependencies are optional so consumers do not
have to install every date library.

## Usage

```ts
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";

export const dateAdapter = new AdapterDateFns();
```

Pass an adapter instance to the `LocalizationProvider` from
`@salt-ds/date-components`. Do not mix date object types from different
adapters in one provider boundary.

See the [Localization provider documentation](https://www.saltdesignsystem.com/salt/components/localization-provider/usage).
