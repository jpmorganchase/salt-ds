import { MenuBase, MenuBaseProps } from "./MenuBase";
import { FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";

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
