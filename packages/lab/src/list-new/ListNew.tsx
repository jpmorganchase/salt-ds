import {
  ComponentType,
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  Ref,
  UIEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./ListNew.css";
import { useForkRef } from "../utils";
import cn from "classnames";
import { ListModelNew } from "./ListModelNew";
import { ListContextNew } from "./ListContextNew";
import { ListItemNew } from "./ListItemNew";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkListNew");

export type ListSelectionMode = "single" | "multi";

export interface ListNewProps<G = any, T = any>
  extends HTMLAttributes<HTMLDivElement> {
  source?: G[];
  getGroupItems?: (groupItem: G) => T[];
  groupComponent?: ComponentType<{ groupItem: G; index: number }>;
  itemComponent?: ComponentType<{ sourceItem: T; index: number }>;
  highlightedItemIndex?: G | T;
  onHighlightedItemIndexChange?: (index: number | undefined) => void;
  displayedItemCount?: number;
  selection?: [number];
  selectionMode?: ListSelectionMode;
}

export const ListNew = forwardRef<HTMLDivElement, ListNewProps>(
  function ListNew<G = any, T = any>(
    props: ListNewProps<G, T>,
    externalRef: Ref<HTMLDivElement>
  ) {
    const {
      className,
      source,
      getGroupItems,
      groupComponent,
      itemComponent,
      highlightedItemIndex,
      onHighlightedItemIndexChange,
      displayedItemCount,
      selection,
      selectionMode,
      ...restProps
    } = props;

    const [listModel] = useState(() => new ListModelNew<G, T>(getGroupItems));
    const viewportRef = useRef<HTMLDivElement>(null);
    const scrollableRef = useRef<HTMLDivElement>(null);
    const ref = useForkRef(viewportRef, externalRef);
    const contextValue = useMemo(() => ({ listModel }), []);
    const visibleItemModels = listModel.useVisibleItemModels()!;
    const virtualHeight = listModel.useVirtualHeight();
    const visibleAreaTop = listModel.useVisibleAreaTop();
    const height = listModel.useHeight();

    const spaceStyle: CSSProperties = useMemo(
      () => ({
        height: `${virtualHeight}px`,
      }),
      [virtualHeight]
    );

    console.log(`ListNew: virtualHeight: ${virtualHeight}`);

    const visibleAreaStyle: CSSProperties = useMemo(
      () => ({
        top: `${visibleAreaTop}px`,
      }),
      [visibleAreaTop]
    );

    listModel.setProps(props);

    const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
      const scrollable = scrollableRef.current;
      if (scrollable) {
        const { scrollTop } = scrollable;
        listModel.onScroll(scrollTop);
      }
    };

    useEffect(() => {
      const scrollable = scrollableRef.current;
      if (scrollable) {
        const { clientHeight } = scrollable;
        listModel.onResize(clientHeight);
        listModel.scrollableElement = scrollable;
      }
    });

    const stickyItem = listModel.useStickyItem();
    const stickyItemTop = listModel.useStickyItemTop();
    const itemWidth = listModel.useItemWidth();

    const stickyItemStyle: CSSProperties = useMemo(() => {
      return {
        top: `${stickyItemTop}px`,
        width: `${itemWidth}px`,
      };
    }, [stickyItemTop, itemWidth]);

    const rootStyle: CSSProperties = useMemo(() => {
      if (height === 0) {
        return {};
      }
      return {
        height: `${height}px`,
      };
    }, [height]);

    return (
      <ListContextNew.Provider value={contextValue}>
        <div
          tabIndex={0}
          className={cn(className, withBaseName())}
          ref={ref}
          onKeyDown={listModel.onKeyDown}
          style={rootStyle}
          {...restProps}
        >
          <div
            ref={scrollableRef}
            className={withBaseName("scrollable")}
            onScroll={onScroll}
          >
            <div className={withBaseName("space")} style={spaceStyle}>
              <div className={withBaseName("items")} style={visibleAreaStyle}>
                {visibleItemModels.map((itemModel, index) => {
                  return (
                    <ListItemNew
                      itemComponent={itemComponent}
                      groupComponent={groupComponent}
                      key={itemModel.index}
                      itemModel={itemModel}
                      measureSize={index === 0}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {stickyItem ? (
            <ListItemNew
              style={stickyItemStyle}
              itemComponent={itemComponent}
              groupComponent={groupComponent}
              itemModel={stickyItem}
              isSticky={true}
            />
          ) : null}
        </div>
      </ListContextNew.Provider>
    );
  }
);
