import { createHandler, createHook } from "./utils";
import { ListNewProps } from "./ListNew";
import { KeyboardEvent } from "react";
import { Rng } from "./Rng";
import { combineStreams, ValueStream } from "./ValueStream";

export interface ListItemMouseEnterEvent {
  listItemIndex: number;
}

export interface ListItemSelectEvent {
  listItemIndex: number;
  clearPrevious: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}

export class ListModelNew<G = any, T = any> {
  private readonly getGroupItems?: (sourceItem: G) => T[];
  private readonly itemMouseEnter$ = new ValueStream<ListItemMouseEnterEvent>(
    "itemMouseEnter$"
  );
  private readonly highlightedItemIndex$ = new ValueStream<number | undefined>(
    "highlightedItemIndex$"
  );
  private readonly selection$ = new ValueStream<number[]>("selection$", []);
  private readonly selectEvents$ = new ValueStream<ListItemSelectEvent>(
    "selectEvents$"
  );
  private readonly source$ = new ValueStream<G[] | undefined>("source$");
  private readonly itemModels$ = new ValueStream<ListItemModelNew[]>(
    "itemModels$",
    []
  );
  private readonly stickyItemIndex$ = new ValueStream<number | undefined>(
    "stickyItemIndex$",
    undefined
  );
  private readonly stickyItem$ = new ValueStream<ListItemModelNew | undefined>(
    "stickyItem$",
    undefined
  );
  private readonly visibleItemModels$ = new ValueStream<ListItemModelNew[]>(
    "visibleItemModels$",
    []
  );
  private readonly props$ = new ValueStream<ListNewProps | undefined>(
    "props$",
    undefined
  );
  private readonly itemHeight$ = new ValueStream<number>("itemHeight$", 0);
  private readonly itemWidth$ = new ValueStream<number>("itemWidth$", 0);
  private readonly itemSizeChangeEvents$ = new ValueStream<{
    height: number;
    width: number;
  }>("itemSizeChangeEvents$");
  private readonly virtualHeight$ = new ValueStream<number>(
    "virtualHeight$",
    0
  );
  private readonly clientHeight$ = new ValueStream<number>("clientHeight$", 0);
  private readonly scrollTop$ = new ValueStream<number>("scrollTop$", 0);
  private readonly visibleRange$ = new ValueStream<Rng>(
    "visibleRange$",
    Rng.empty
  );
  private readonly visibleAreaTop$ = new ValueStream<number>(
    "visibleAreaTop$",
    0
  );
  private readonly stickyItemTop$ = new ValueStream<number>(
    "stickyItemTop$",
    0
  );
  private readonly height$ = new ValueStream<number>("height$", 0);
  private readonly displayedItemCount$ = new ValueStream<number>(
    "displayedItemCount$",
    10
  );

  private readonly keyDownEvents$ = new ValueStream<KeyboardEvent>(
    "keyDownEvents$"
  );

  public onListItemMouseEnter = createHandler(this.itemMouseEnter$);
  public useHighlightedItemIndex = createHook(this.highlightedItemIndex$);
  public useItemModels = createHook(this.itemModels$);
  public setProps = createHandler(this.props$);
  public onKeyDown = createHandler(this.keyDownEvents$);
  public onScroll = createHandler(this.scrollTop$);
  public useVirtualHeight = createHook(this.virtualHeight$);
  public useClientHeight = createHook(this.clientHeight$);
  public onResize = createHandler(this.clientHeight$);
  public setItemSize = createHandler(this.itemSizeChangeEvents$);
  public useVisibleAreaTop = createHook(this.visibleAreaTop$);
  public useVisibleItemModels = createHook(this.visibleItemModels$);
  public useStickyItem = createHook(this.stickyItem$);
  public useStickyItemTop = createHook(this.stickyItemTop$);
  public useItemWidth = createHook(this.itemWidth$);
  public useHeight = createHook(this.height$);
  public onSelect = createHandler(this.selectEvents$);
  public useSelection = createHook(this.selection$);

  public scrollableElement?: HTMLDivElement;

  constructor(getGroupItems?: (item: G) => T[]) {
    this.getGroupItems = getGroupItems;

    this.itemMouseEnter$.listen((event) => {
      this.highlightedItemIndex$.push(event.listItemIndex);
    });

    this.props$.listen((props) => {
      if (!props) {
        return;
      }
      const { source, highlightedItemIndex, displayedItemCount, selection } =
        props;
      this.source$.push(source);
      if (highlightedItemIndex != undefined) {
        this.highlightedItemIndex$.push(highlightedItemIndex);
      }
      if (displayedItemCount != undefined) {
        this.displayedItemCount$.push(displayedItemCount);
      }
      if (selection != undefined) {
        this.selection$.push(selection);
      }
    });

    combineStreams(
      this.displayedItemCount$,
      this.itemHeight$,
      this.itemModels$
    ).listen(([displayedItemCount, itemHeight, itemModels]) => {
      this.height$.push(
        Math.min(displayedItemCount!, itemModels!.length) * itemHeight!
      );
    });

    this.source$.listen((source) => {
      const models: ListItemModelNew<G, T>[] = [];
      let index = 0;
      if (source) {
        source.forEach((sourceItem) => {
          if (!this.getGroupItems) {
            models.push(new ListItemModelNew<G, T>(index++, sourceItem, false));
          } else {
            models.push(new ListItemModelNew<G, T>(index++, sourceItem, true));
            const groupItems = this.getGroupItems(sourceItem);
            groupItems.forEach((item) => {
              models.push(new ListItemModelNew<G, T>(index++, item, false));
            });
          }
        });
      }
      this.itemModels$.push(models);
    });

    combineStreams(this.itemModels$, this.visibleRange$).listen(
      ([itemModels, visibleRange]) => {
        this.visibleItemModels$.push(
          itemModels!.slice(visibleRange!.start, visibleRange?.end)
        );
        if (itemModels && itemModels.length > 0) {
          for (let i = visibleRange!.start; i >= 0; --i) {
            if (itemModels[i].isGroup) {
              this.stickyItemIndex$.push(i);
              break;
            }
          }
        }
      }
    );

    combineStreams(this.itemModels$, this.stickyItemIndex$).listen(
      ([itemModels, stickyItemIndex]) =>
        this.stickyItem$.push(
          stickyItemIndex != undefined
            ? itemModels![stickyItemIndex]
            : undefined
        )
    );

    combineStreams(
      this.itemModels$,
      this.stickyItemIndex$,
      this.itemHeight$,
      this.scrollTop$
    ).listen(([itemModels, stickyItemIndex, itemHeight, scrollTop]) => {
      let stickyItemTop = 0;
      if (
        itemModels == undefined ||
        itemModels.length === 0 ||
        stickyItemIndex == undefined
      ) {
      } else {
        let nextStickyItemIndex = -1;
        for (let i = stickyItemIndex + 1; i < itemModels.length; ++i) {
          if (itemModels[i].isGroup) {
            nextStickyItemIndex = i;
            break;
          }
        }
        if (nextStickyItemIndex !== -1) {
          const nextStickyItemTop = nextStickyItemIndex * itemHeight!;
          if (nextStickyItemTop - itemHeight! < scrollTop!) {
            stickyItemTop = nextStickyItemTop - itemHeight! - scrollTop!;
          }
        }
      }
      this.stickyItemTop$.push(stickyItemTop);
    });

    // combineStreams(
    //   this.itemModels$,
    //   this.stickyItemIndex$,
    //   this.scrollTop$
    // ).listen(([itemModels, stickyItemIndex, scrollTop]) => {});

    this.itemSizeChangeEvents$.listen((size) => {
      this.itemHeight$.push(size.height);
      this.itemWidth$.push(size.width);
    });

    combineStreams(this.itemModels$, this.itemHeight$).listen(
      ([itemModels, itemHeight]) =>
        this.virtualHeight$.push(
          itemModels ? itemModels.length * itemHeight! : 0
        )
    );

    combineStreams(
      this.scrollTop$,
      this.itemHeight$,
      this.clientHeight$
    ).listen(([scrollTop, itemHeight, viewportHeight]) => {
      const firstIndex = Math.floor(scrollTop! / itemHeight!);
      const lastIndex = Math.ceil((scrollTop! + viewportHeight!) / itemHeight!);
      this.visibleRange$.push(new Rng(firstIndex, lastIndex));
    });

    combineStreams(this.visibleRange$, this.itemHeight$).listen(
      ([visibleRange, itemHeight]) => {
        this.visibleAreaTop$.push(visibleRange!.start * itemHeight!);
      }
    );

    this.highlightedItemIndex$.listen((next, prev) => {
      const itemModels = this.itemModels$.getCurrent()!;
      if (prev != undefined) {
        const oldItem = itemModels[prev];
        oldItem.isHighlighted$.push(false);
      }
      if (next != undefined) {
        const newItem = itemModels[next];
        newItem.isHighlighted$.push(true);
      }
    });

    this.selectEvents$.listen((event) => {
      const { listItemIndex, clearPrevious } = event;
      const selectionMode = this.props$.getCurrent()?.selectionMode;
      if (clearPrevious || selectionMode !== "multi") {
        this.selection$.push([listItemIndex]);
      } else {
        const oldSelection = this.selection$.getCurrent() || [];
        if (oldSelection.includes(listItemIndex)) {
          const newSelection = oldSelection.filter((x) => x !== listItemIndex);
          this.selection$.push(newSelection);
        } else {
          const newSelection = [...oldSelection, listItemIndex];
          this.selection$.push(newSelection);
        }
      }
    });

    this.selection$.listen((newSelection, oldSelection) => {
      const itemModels = this.itemModels$.getCurrent()!;
      const oldSet = new Set(oldSelection);
      const newSet = new Set(newSelection);
      const itemsToUnselect = new Set<number>();
      const itemsToSelect = new Set<number>();
      oldSet.forEach((i) => {
        if (!newSet.has(i)) {
          itemsToUnselect.add(i);
        }
      });
      newSet.forEach((i) => {
        if (!oldSet.has(i)) {
          itemsToSelect.add(i);
        }
      });
      itemsToUnselect.forEach((i) => {
        const item = itemModels[i];
        if (item) {
          item.isSelected$.push(false);
        }
      });
      itemsToSelect.forEach((i) => {
        const item = itemModels[i];
        if (item) {
          item.isSelected$.push(true);
        }
      });
    });

    this.keyDownEvents$.listen((event) => {
      const { key } = event;
      let preventDefault = true;
      if (key === "ArrowUp") {
        this.moveHighlightedIndex(-1);
      } else if (key === "ArrowDown") {
        this.moveHighlightedIndex(1);
      } else if (key === "PageUp") {
        this.moveHighlightedIndex(-10);
      } else if (key === "PageDown") {
        this.moveHighlightedIndex(10);
      } else if (key === "Home") {
        this.setHighlightedIndex(this.findFirstNonGroupIndex());
      } else if (key === "End") {
        this.setHighlightedIndex(this.findLastNonGroupIndex());
      } else {
        preventDefault = false;
      }
      if (preventDefault) {
        event.preventDefault();
      }
    });
  }

  private moveHighlightedIndex(shift: number) {
    const index = this.highlightedItemIndex$.getCurrent();
    if (index != undefined) {
      const itemModels = this.itemModels$.getCurrent()!;
      const maxIndex = itemModels.length - 1;
      let newIndex = clamp(index + shift, 0, maxIndex);
      if (itemModels[newIndex].isGroup) {
        newIndex = this.findNearestNonGroupIndex(newIndex, shift);
      }
      this.setHighlightedIndex(newIndex);
    }
  }

  private findNearestNonGroupIndex(index: number, shift: number) {
    const itemModels = this.itemModels$.getCurrent()!;
    let result = index;
    const step = shift > 0 ? 1 : -1;
    while (itemModels[result].isGroup) {
      result += step;
      if (result < 0) {
        return this.findFirstNonGroupIndex();
      }
      if (result > itemModels.length - 1) {
        return this.findLastNonGroupIndex();
      }
    }
    return result;
  }

  private findFirstNonGroupIndex() {
    const itemModels = this.itemModels$.getCurrent()!;
    return itemModels.findIndex((itemModel) => !itemModel.isGroup);
  }

  private findLastNonGroupIndex() {
    const itemModels = this.itemModels$.getCurrent()!;
    for (let i = itemModels.length - 1; i > 0; i--) {
      if (!itemModels[i].isGroup) {
        return i;
      }
    }
    return -1;
  }

  private setHighlightedIndex(index: number | undefined) {
    const props = this.props$.getCurrent();
    if (props?.onHighlightedItemIndexChange) {
      props.onHighlightedItemIndexChange(index);
    }
    if (props?.highlightedItemIndex === undefined) {
      this.highlightedItemIndex$.push(index);
    }
    if (index != undefined) {
      this.scrollToView(index);
    }
  }

  private scrollToView(index: number) {
    if (!this.scrollableElement) {
      return;
    }
    const itemHeight = this.itemHeight$.getCurrent()!;
    const viewportHeight = this.clientHeight$.getCurrent()!;
    const scrollTop = this.scrollTop$.getCurrent()!;
    const stickyItem = this.stickyItem$.getCurrent()!;

    let firstFullyVisibleIndex = Math.ceil(scrollTop / itemHeight);
    if (stickyItem !== undefined) {
      firstFullyVisibleIndex += 1;
    }

    const lastFullyVisibleIndex = Math.floor(
      (scrollTop + viewportHeight - itemHeight) / itemHeight
    );
    if (index < firstFullyVisibleIndex) {
      let newScrollTop = itemHeight * index;
      if (stickyItem != undefined && stickyItem.index !== index) {
        newScrollTop -= itemHeight;
      }
      this.scrollableElement.scrollTop = newScrollTop;
    } else if (lastFullyVisibleIndex < index) {
      this.scrollableElement.scrollTop =
        (index + 1) * itemHeight - viewportHeight;
    }
  }
}

export class ListItemModelNew<G = any, T = any> {
  public readonly index: number;
  public readonly isGroup: boolean;
  public readonly isHighlighted$ = new ValueStream<boolean>(
    "isHighlighted$",
    false
  );
  public readonly isSelected$ = new ValueStream<boolean>("isSelected", false);
  public readonly sourceItem$: ValueStream<G | T>;

  public useIsHighlighted = createHook(this.isHighlighted$);
  public useIsSelected = createHook(this.isSelected$);
  public useSourceItem: () => G | T | undefined;

  constructor(index: number, sourceItem: G | T, isGroup: boolean) {
    this.index = index;
    this.isGroup = isGroup;
    this.sourceItem$ = new ValueStream("sourceItem$", sourceItem);
    this.useSourceItem = createHook(this.sourceItem$);
  }
}
