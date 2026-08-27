# `@salt-ds/react-resizable-panels-theme`

Salt styling for resize handles and panels created with
`react-resizable-panels`.

## Install

```sh
npm install @salt-ds/react-resizable-panels-theme react-resizable-panels @salt-ds/theme
```

`react-resizable-panels` 3 or newer and `@salt-ds/theme` are peer dependencies.
Import the current Salt theme CSS before this package's stylesheet.

## Usage

```ts
import "@salt-ds/react-resizable-panels-theme/index.css";
```

Add `react-resizable-panels-theme-salt` to the panel-group wrapper and use the
documented Salt resize-handle classes. This package styles the upstream
library; it does not re-export its React components or behavior.

See the [Splitter documentation](https://www.saltdesignsystem.com/salt/components/splitter).
