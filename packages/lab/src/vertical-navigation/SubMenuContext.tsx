import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
} from "react";

type SubMenuContextValue = {
  depth: number;
  iconPaddingCount: number;
  setDirectIcons?: Dispatch<SetStateAction<string[]>>;
};

export const SubMenuContext = createContext<SubMenuContextValue>(
  "SubMenuContext",
  { depth: -1, iconPaddingCount: 0 },
);

export const useSubMenuContext = () => {
  return useContext(SubMenuContext);
};

export function SubMenuProvider({
  children,
  directIcons,
  setDirectIcons,
}: {
  children: ReactNode;
  directIcons: string[];
  setDirectIcons?: Dispatch<SetStateAction<string[]>>;
}) {
  const { depth, iconPaddingCount } = useSubMenuContext();

  const context = useMemo(
    () => ({
      depth: depth + 1,
      iconPaddingCount: iconPaddingCount + (directIcons.length > 0 ? 1 : 0),
      setDirectIcons,
    }),
    [depth, iconPaddingCount, directIcons, setDirectIcons],
  );

  return (
    <SubMenuContext.Provider value={context}>
      {children}
    </SubMenuContext.Provider>
  );
}
