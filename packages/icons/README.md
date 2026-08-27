# `@salt-ds/icons`

React components for Salt's SVG icon set.

## Install

```sh
npm install @salt-ds/icons
```

React and React DOM are peer dependencies. Icons use current Salt color and
size tokens when rendered inside a Salt provider. No separate CSS import is
required for normal runtime style injection.

## Usage

```tsx
import { SearchIcon } from "@salt-ds/icons";

export function DecorativeSearchIcon() {
  return <SearchIcon aria-hidden />;
}
```

Give standalone informative icons an accessible name. Hide decorative icons
when an adjacent label already communicates their meaning.

See the [Icon documentation](https://www.saltdesignsystem.com/salt/components/icon).
