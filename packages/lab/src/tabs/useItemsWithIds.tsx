import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { TabPanel } from "./TabPanel";
import type { TabDescriptor } from "./TabsTypes";

type TabMap = { [key: string]: TabDescriptor };

export const useItemsWithIds = (
  children: ReactNode,
  id = "root",
): [TabDescriptor[], (id: string) => TabDescriptor] => {
  const normalizeItems = useCallback(
    (items: ReactNode): [TabDescriptor[], TabMap] => {
      const sourceMap: TabMap = {};
      const tabDescriptors: TabDescriptor[] = Children.toArray(items)
        .filter(isValidElement)
        .map((child: ReactElement, index: number) => {
          const {
            "data-label": dataLabel = `Tab ${index + 1}`,
            enableClose: closeable,
            label = dataLabel,
          } = child.props;
          const tabId = `${id}-${index}`;
          const tabPanelId = `${tabId}-panel`;
          const props = {
            "aria-labelledby": tabId,
            id: tabPanelId,
            key: tabId,
          };
          const element: JSX.Element | undefined =
            child.type === TabPanel ? (
              cloneElement(child, props)
            ) : (
              <TabPanel {...props} label={label} key={tabId}>
                {child}
              </TabPanel>
            );
          const tab: TabDescriptor = {
            closeable,
            element,
            id: tabId,
            label,
          };
          sourceMap[tabId] = tab;
          return tab;
        });
      return [tabDescriptors, sourceMap];
    },
    [id],
  );

  const [sourceWithIds, sourceMap] = useMemo(() => {
    return normalizeItems(children);
  }, [normalizeItems, children]);

  const itemById = useCallback((id: string) => sourceMap[id], [sourceMap]);

  return [sourceWithIds, itemById];
};
