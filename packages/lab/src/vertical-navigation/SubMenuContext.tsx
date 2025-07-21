import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
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

export function SubMenuProvider({ children }: { children: ReactNode }) {
  const { depth, iconPaddingCount } = useSubMenuContext();

  const [directIcons, setDirectIcons] = useState<string[]>([]);

  const context = useMemo(
    () => ({
      depth: depth + 1,
      iconPaddingCount: iconPaddingCount + (directIcons.length > 0 ? 1 : 0),
      setDirectIcons,
    }),
    [depth, iconPaddingCount, directIcons],
  );

  return (
    <SubMenuContext.Provider value={context}>
      {children}
    </SubMenuContext.Provider>
  );
}
