import * as React from "react";

// eslint-disable-next-line -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeReactUseId: undefined | (() => string) = (React as any)[
  `${"useId"}${""}`
];

let globalId = BigInt(0);
function useIdLegacy(idOverride?: string): string | undefined {
  const [defaultId, setDefaultId] = React.useState(idOverride);
  const id = idOverride || defaultId;
  React.useEffect(() => {
    if (defaultId == null) {
      setDefaultId(`uitk-${++globalId}`);
    }
  }, [defaultId]);
  return id;
}

export function useId(idOverride?: string): string | undefined {
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
    return idOverride ?? `uitk-${++globalId}`;
  }, [idOverride]);
  return id;
}
