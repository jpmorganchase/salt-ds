import * as React from "react";

// eslint-disable-next-line -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeReactUseId: undefined | (() => string) = (React as any)[
  "useId" + ""
];

function useIdLegacy(idOverride?: string): string {
  const [defaultId, setDefaultId] = React.useState(idOverride);
  const id = idOverride || defaultId;
  React.useEffect(() => {
    if (defaultId == null) {
      // Fallback to this default id when possible.
      // Use the random value for client-side rendering only.
      // We can't use it server-side.
      setDefaultId(`uitk-${Math.round(Math.random() * 1e5)}`);
    }
  }, [defaultId]);
  return id as string;
}

export function useId(idOverride?: string): string {
  if (maybeReactUseId !== undefined) {
    const reactId = maybeReactUseId();
    return idOverride ?? reactId;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- `React.useId` is invariant at runtime.
  return useIdLegacy(idOverride);
}

// Note: Some usages require that an id is returned on first call, not only post-first-render
// (as with the useEffect solution). This can go away once we totally move to React 18
export function useIdMemo(idOverride?: string): string {
  const id = React.useMemo(() => {
    return idOverride ?? `uitk-${Math.round(Math.random() * 1e5)}`;
  }, [idOverride]);
  return id;
}
