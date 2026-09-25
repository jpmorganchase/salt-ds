import { FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { MenuBase, type MenuBaseProps } from "./MenuBase";
import {
  MenuSelectionStoreContext,
  useMenuSelectionStore,
} from "./MenuSelectionStoreContext";

export interface MenuProps extends MenuBaseProps {}

function MenuSelectionStoreProvider({ children }: { children: ReactNode }) {
  const [storedSelection, setStoredSelection] = useState<
    Record<string, string[]>
  >({});

  const getSelected = useCallback(
    (name: string) => storedSelection[name],
    [storedSelection],
  );

  const setSelected = useCallback((name: string, selected: string[]) => {
    setStoredSelection((previous) => ({ ...previous, [name]: selected }));
  }, []);

  const store = useMemo(
    () => ({ getSelected, setSelected }),
    [getSelected, setSelected],
  );

  return (
    <MenuSelectionStoreContext.Provider value={store}>
      {children}
    </MenuSelectionStoreContext.Provider>
  );
}

export function Menu(props: MenuProps) {
  const parentId = useFloatingParentNodeId();
  const parentSelectionStore = useMenuSelectionStore();

  const menu =
    parentId === null ? (
      <FloatingTree>
        <MenuBase {...props} />
      </FloatingTree>
    ) : (
      <MenuBase {...props} />
    );

  if (parentSelectionStore) {
    return menu;
  }

  return <MenuSelectionStoreProvider>{menu}</MenuSelectionStoreProvider>;
}
