import { useControlled } from "@jpmorganchase/uitk-core";
import { MouseEventHandler, RefObject, useCallback } from "react";
import { ManagedItem } from "../responsive";
import { DragHookResult, dragStrategy, useDragDrop } from "./drag-drop";
import {
  composableTabProps,
  exitEditHandler,
  TabDescriptor,
  TabElement,
} from "./TabstripProps";
import { useEditableItem } from "./useEditableItem";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { useSelection } from "./useSelection";

type setTabsType = (tabs: TabDescriptor[] | TabElement[]) => void;

interface tabstripHookProps {
  allowDragDrop?: boolean | dragStrategy;
  defaultValue?: number;
  defaultTabs?: TabDescriptor[];
  enableAddTab: boolean;
  innerContainerRef: RefObject<HTMLDivElement>;
  keyBoardActivation?: "manual" | "automatic";
  managedItems: ManagedItem[];
  onChange?: (tabIndex: number) => void;
  onMoveTab?: (fromIndex: number, toIndex: number) => void;
  orientation: "horizontal" | "vertical";
  tabs?: TabDescriptor[] | TabElement[];
  value?: number;
}

//TODO create this from composite hooks
interface tabstripHookResult {
  activateTab: (tabIndex: number) => void;
  controlledSelection: boolean;
  editing: boolean;
  focusedIndex: number;
  focusTab: (tabIndex: number, immediateFocus?: boolean) => void;
  isDragging?: boolean;
  navItemRefs: RefObject<Array<RefObject<HTMLElement>>>;
  onMouseDown?: MouseEventHandler;
  setEditing: (value: boolean) => void;
  setTabs: setTabsType;
  tabs: TabDescriptor[] | TabElement[];
  value: number;
  tabProps: composableTabProps;
}

// Simple strings for tab labels are accepted as input, convert to TabDescriptors internally

export const useTabstrip = ({
  allowDragDrop = false,
  defaultValue,
  enableAddTab,
  innerContainerRef,
  keyBoardActivation,
  managedItems,
  onChange,
  onMoveTab,
  orientation,
  defaultTabs,
  tabs: tabsProp,
  value: valueProp,
}: tabstripHookProps): tabstripHookResult & DragHookResult => {
  const [tabs, setTabs] = useControlled<TabDescriptor[] | TabElement[]>({
    controlled: tabsProp,
    default: defaultTabs ?? [],
    name: "Tabstrip",
    state: "tabs",
  });

  const overflowedItems = managedItems.filter((item) => item.overflowed);

  const getItemCount = () => {
    let itemCount = tabs.length;
    if (enableAddTab) {
      itemCount += 1;
    }
    if (overflowedItems.length > 0) {
      itemCount += 1;
    }
    return itemCount;
  };

  const selectionHook = useSelection({
    defaultValue,
    onChange,
    value: valueProp,
  });

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Always activate the dropped tab. We might want to make this a configuration option

      // if (fromIndex === selectionHook.value) {
      //   const newSelectedTab =
      //     toIndex === -1
      //       ? tabs.length - 1
      //       : toIndex < fromIndex
      //       ? toIndex
      //       : toIndex - 1;
      //   selectionHook.activateTab(newSelectedTab);
      // } else if (
      //   fromIndex < selectionHook.value &&
      //   toIndex > selectionHook.value
      // ) {
      //   selectionHook.activateTab(selectionHook.value - 1);
      // }

      onMoveTab?.(fromIndex, toIndex);
      selectionHook.activateTab(toIndex);
    },
    [onMoveTab, selectionHook.value, tabs]
  );

  const dragDropHook = useDragDrop({
    allowDragDrop,
    containerRef: innerContainerRef,
    extendedDropZone: overflowedItems.length > 0,
    onDrop: handleDrop,
    orientation: "horizontal",
    itemQuery: ".uitkTab",
  });

  const keyboardHook = useKeyboardNavigation({
    itemCount: getItemCount(),
    keyBoardActivation,
    orientation,
    value: selectionHook.value,
  });

  const handleExitEditMode = useCallback<exitEditHandler>(
    (originalValue, editedValue, allowDeactivation, tabIndex) => {
      editableHook.onExitEditMode(
        originalValue,
        editedValue,
        allowDeactivation,
        tabIndex
      );
      if (setTabs) {
        setTabs(
          //@ts-ignore tabs can only be TabDescriptors here
          tabs.map<TabDescriptor>((tab: TabDescriptor, idx) =>
            idx === tabIndex ? { ...tab, label: editedValue } : tab
          )
        );
      }
      if (!allowDeactivation) {
        keyboardHook.focusTab(tabIndex);
      }
    },
    [keyboardHook.focusTab, setTabs]
  );

  const editableHook = useEditableItem();

  const handleClick = useCallback(
    (evt, tabIndex) => {
      // releasing the mouse at end of drag will trigger a click, ignore those
      if (!dragDropHook.isDragging) {
        keyboardHook.onClick(evt, tabIndex);
        selectionHook.onClick(evt, tabIndex);
      }
    },
    [dragDropHook.isDragging, keyboardHook.onClick, selectionHook.onClick]
  );

  const handleKeyDown = useCallback(
    (evt, tabIndex) => {
      keyboardHook.onKeyDown(evt, tabIndex);
      if (!evt.defaultPrevented) {
        selectionHook.onKeyDown(evt, tabIndex);
      }
      if (!evt.defaultPrevented) {
        editableHook.onKeyDown(evt, tabIndex);
      }
    },
    [keyboardHook.onKeyDown, selectionHook.onKeyDown, editableHook.onKeyDown]
  );

  const { tabProps: dragTabProps, ...dragProps } = dragDropHook;

  const tabProps: composableTabProps = {
    onBlur: keyboardHook.onBlur,
    onFocus: keyboardHook.onFocus,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onEnterEditMode: editableHook.onEnterEditMode,
    onExitEditMode: handleExitEditMode,
    ...dragTabProps,
  };

  return {
    activateTab: selectionHook.activateTab,
    controlledSelection: selectionHook.isControlled,
    editing: editableHook.editing,
    focusTab: keyboardHook.focusTab,
    focusedIndex: keyboardHook.focusedIndex,
    navItemRefs: keyboardHook.navItemRefs,
    setEditing: editableHook.setEditing,
    setTabs,
    tabs,
    value: selectionHook.value,
    tabProps,
    ...dragProps,
  };
};
