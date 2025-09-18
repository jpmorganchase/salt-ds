import { useSyncExternalStore } from "use-sync-external-store/shim";

function subscribe() {
  return () => {};
}

// TODO consider moving this to utils
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
