# Salt Styles

`@salt-ds/styles` provides shared styling/runtime primitives used by Salt packages, including:

- CSS injection helpers (`useComponentCssInjection`, insertion point support, CSP nonce support)
- class-name injection extensions (`ClassNameInjectionProvider`, `useClassNameInjection`)
- component defaults provider (`ComponentDefaultsProvider`, `useComponentDefaults`)

See Salt docs for full usage guidance: [https://www.saltdesignsystem.com](https://www.saltdesignsystem.com)

## Installation

```bash
npm install @salt-ds/styles
# or
yarn add @salt-ds/styles
```

## Component defaults quick start

```tsx
import { Button, Input } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";

const defaults: ComponentDefaultsRegistry = {
  saltButton: { props: { appearance: "transparent" } },
  saltInput: { props: { bordered: true } },
};

export function App() {
  return (
    <ComponentDefaultsProvider value={defaults}>
      <Button>Action</Button>
      <Input placeholder="Search" />
    </ComponentDefaultsProvider>
  );
}
```

## Component defaults support matrix

`ComponentDefaultsProvider` accepts only curated props per component key (from `@salt-ds/core` augmentation).

| Component key            | Defaultable props                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `saltBanner`             | `variant`                                                                                                                                |
| `saltButton`             | `appearance`, `sentiment`, `variant`, `loadingAnnouncement`, `focusableWhenDisabled`                                                     |
| `saltCard`               | `variant`                                                                                                                                |
| `saltComboBox`           | `variant`, `bordered`, `truncate`, `selectOnTab`                                                                                         |
| `saltDrawer`             | `variant`                                                                                                                                |
| `saltDropdown`           | `variant`, `bordered`, `emptyReadOnlyMarker`, `placeholder`                                                                              |
| `saltInput`              | `variant`, `bordered`, `textAlign`, `emptyReadOnlyMarker`, `placeholder`                                                                 |
| `saltInteractableCard`   | `variant`                                                                                                                                |
| `saltKbd`                | `variant`                                                                                                                                |
| `saltLinkButton`         | `sentiment`                                                                                                                              |
| `saltLinkCard`           | `variant`                                                                                                                                |
| `saltListBox`            | `bordered`                                                                                                                               |
| `saltMultilineInput`     | `variant`, `bordered`                                                                                                                    |
| `saltNumberInput`        | `variant`, `bordered`, `textAlign`, `emptyReadOnlyMarker`, `placeholder`, `hideButtons`, `clamp`, `step`, `stepMultiplier`, `min`, `max` |
| `saltPanel`              | `variant`                                                                                                                                |
| `saltPillInput`          | `variant`, `bordered`                                                                                                                    |
| `saltSidePanel`          | `variant`                                                                                                                                |
| `saltTabList`            | `appearance`                                                                                                                             |
| `saltTable`              | `variant`                                                                                                                                |
| `saltTFoot`              | `variant`                                                                                                                                |
| `saltTHead`              | `variant`                                                                                                                                |
| `saltTag`                | `variant`, `bordered`                                                                                                                    |
| `saltText`               | `variant`                                                                                                                                |
| `saltToggleButton`       | `appearance`, `sentiment`                                                                                                                |
| `saltToggleButtonGroup`  | `appearance`, `sentiment`                                                                                                                |
| `saltToolbar`            | `variant`, `appearance`                                                                                                                  |
| `saltTooltip`            | `placement`, `hideArrow`, `hideIcon`, `enterDelay`, `leaveDelay`, `disableHoverListener`, `disableFocusListener`                         |
| `saltVerticalNavigation` | `appearance`                                                                                                                             |

### Notes

- Instance props override provider defaults.
- `rootDataAttributes` supports root-level `data-*` attributes only.
- Defaults are static values (no function resolvers in current API).

## Class name injection

`ClassNameInjectionProvider` / `useClassNameInjection` are for class-based extension scenarios where you want to derive classes from props (and optionally consume those props before forwarding).

Use this when:

- you need additional classes computed from curated extension props
- you want to strip implementation-only props before they hit the DOM
- you do **not** need to set default prop values (use `ComponentDefaultsProvider` for that)

```tsx
import {
  ClassNameInjectionProvider,
  type ClassNameInjectionRegistry,
  registerClassInjector,
} from "@salt-ds/styles";

const registry: ClassNameInjectionRegistry = new Map();

registerClassInjector(
  registry,
  "saltButton",
  ["size"],
  ({ size }: { size?: "sm" | "md" | "lg" }) =>
    size ? `myButton-size-${size}` : undefined,
);

<ClassNameInjectionProvider value={registry}>
  {/* children */}
</ClassNameInjectionProvider>;
```

Notes:

- Returning `undefined` from an injector opts out and leaves registered keys untouched.
- Returning a class string (including `""`) opts in and consumes registered keys.

## CSS injection

Use `useComponentCssInjection` to inject component/package CSS into the active window (including popout/multi-window hosts).

Use this when:

- a component's styles must be available in non-default windows
- you want Salt-style de-duplicated injection behavior
- you need CSP nonce support or insertion point control from provider context

```tsx
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import exampleCss from "./Example.css";

export function Example() {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-example",
    css: exampleCss,
    window: targetWindow,
  });

  return <div className="saltExample-root">Content</div>;
}
```

Notes:

- Prefer a stable `testId` in `salt-` kebab-case for injected styles.
- CSS is imported as a value and passed into the hook; avoid side-effect-only CSS imports.
