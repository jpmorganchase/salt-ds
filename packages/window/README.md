# Window

Provides a React context-based approach to access the `window` object, with built-in SSR safety. Useful for sharing a window reference across components, supporting multi-window scenarios (e.g. pop-out windows), or substituting a mock window in tests.

## Installation

```bash
yarn add @salt-ds/window
```

## Usage

Wrap your app with `WindowProvider` and pass the window reference:

```tsx
import { WindowProvider } from "@salt-ds/window";

export function App() {
  return (
    <WindowProvider window={typeof window !== "undefined" ? window : null}>
      <YourApp />
    </WindowProvider>
  );
}
```

Then access it anywhere using `useWindow`:

```tsx
import { useWindow } from "@salt-ds/window";

export function MyComponent() {
  const window = useWindow();

  if (!window) {
    return null;
  }

  return <div>Window width: {window.innerWidth}</div>;
}
```

## Why Use This?

- **SSR safe** — falls back to `null` when `window` is undefined
- **Context-based** — avoids prop drilling for the window reference
- **Testable** — easily provide a mock window in tests
