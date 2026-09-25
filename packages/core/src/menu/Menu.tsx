import { FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";
import { type ReactNode, useState } from "react";
import { MenuBase, type MenuBaseProps } from "./MenuBase";
import {
  type MenuSelectionStore,
  MenuSelectionStoreContext,
  useMenuSelectionStore,
} from "./MenuSelectionStoreContext";

export interface MenuProps extends MenuBaseProps {}

function MenuSelectionStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<MenuSelectionStore>(() => {
    const selections = new Map<string, string[]>();
    return {
      getSelected: (name) => selections.get(name),
      setSelected: (name, selected) => {
        selections.set(name, selected);
      },
    };
  });

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
