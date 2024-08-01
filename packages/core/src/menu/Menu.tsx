import { FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";
import { MenuBase, type MenuBaseProps } from "./MenuBase";

export interface MenuProps extends MenuBaseProps {}

export function Menu(props: MenuProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuBase {...props} />
      </FloatingTree>
    );
  }

  return <MenuBase {...props} />;
}
