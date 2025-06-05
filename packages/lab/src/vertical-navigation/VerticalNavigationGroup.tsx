import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

type VerticalNavigationGroupContextValue = {
  expanded?: boolean;
  setExpanded?: Dispatch<SetStateAction<boolean>>;
  regionId?: string;
  setRegionId?: Dispatch<SetStateAction<string>>;
};

export const VerticalNavigationGroupContext =
  createContext<VerticalNavigationGroupContextValue>(
    "VerticalNavigationGroupContext",
    {
      expanded: false,
      setExpanded: () => {},
      regionId: "",
      setRegionId: () => {},
    },
  );

export interface VerticalNavigationGroupProps {
  children?: ReactNode;
}

export function useVerticalNavigationGroup() {
  return useContext(VerticalNavigationGroupContext);
}

export function VerticalNavigationGroup(props: VerticalNavigationGroupProps) {
  const { children } = props;

  const [expanded, setExpanded] = useState(false);
  const [regionId, setRegionId] = useState("");

  return (
    <VerticalNavigationGroupContext.Provider
      value={{ expanded, setExpanded, regionId, setRegionId }}
    >
      {children}
    </VerticalNavigationGroupContext.Provider>
  );
}
