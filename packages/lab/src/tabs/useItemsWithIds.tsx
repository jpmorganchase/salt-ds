import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { TabPanel } from "./TabPanel";
import { TabDescriptor } from "./TabsTypes";

type TabMap = { [key: string]: TabDescriptor };

export const useItemsWithIds = (
  children: ReactNode,
  id = "root"
): [TabDescriptor[], (id: string) => TabDescriptor] => {
  const normalizeItems = useCallback(
    (items): [TabDescriptor[], TabMap] => {
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
              <TabPanel {...props} label={label}>
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
    [id]
  );

  const [sourceWithIds, sourceMap] = useMemo(() => {
    return normalizeItems(children);
  }, [normalizeItems, children]);

  const itemById = useCallback(
    (id: string) => sourceMap[id],
    [sourceWithIds, sourceMap]
  );

  return [sourceWithIds, itemById];
};
