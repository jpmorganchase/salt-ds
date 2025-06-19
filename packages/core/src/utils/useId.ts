/** biome-ignore-all lint/correctness/useHookAtTopLevel: `React.useId` is invariant at runtime. */
import * as React from "react";

// Workaround for https://github.com/webpack/webpack/issues/14814#issuecomment-1536757985
// Without `toString()`, downstream library using webpack to re-bundle will error
const maybeReactUseId: undefined | (() => string) = (React as any)[
  "useId".toString()
];

let globalId = BigInt(0);
function useIdLegacy(idOverride?: string): string | undefined {
  const [defaultId, setDefaultId] = React.useState(idOverride);
  const id = idOverride || defaultId;
  React.useEffect(() => {
    if (defaultId == null) {
      setDefaultId(`salt-${++globalId}`);
    }
  }, [defaultId]);
  return id;
}

export function useId(idOverride?: string): string | undefined {
  if (maybeReactUseId !== undefined) {
    const reactId = maybeReactUseId();
    return idOverride ?? reactId;
  }
  return useIdLegacy(idOverride);
}

// Note: Some usages require that an id is returned on first call, not only post-first-render
// (as with the useEffect solution). This can go away once we totally move to React 18
export function useIdMemo(idOverride?: string): string {
  return React.useMemo(() => {
    return idOverride ?? `salt-${++globalId}`;
  }, [idOverride]);
}
