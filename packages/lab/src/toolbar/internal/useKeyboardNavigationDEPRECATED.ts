import { useCallback, KeyboardEvent, MutableRefObject } from "react";

type edge = "first" | "last";

const moveFocus = (selectedItem: HTMLElement, nextSelectable?: HTMLElement) => {
  if (nextSelectable && selectedItem !== nextSelectable) {
    selectedItem.blur();
    nextSelectable.focus();
  }
};

// HTMLElement does not have 'disabled' but many subtypes of HTMLElement do
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nonDisabledElement = (element: any) => element.disabled !== true;

const handleEdgeMove = (
  event: KeyboardEvent<HTMLElement>,
  selectedItem: HTMLElement,
  edge: edge,
  activeItems: HTMLElement[]
) => {
  const nextIndex = edge === "first" ? 0 : activeItems.length - 1;
  const nextSelectable = activeItems[nextIndex];
  if (nextSelectable) {
    moveFocus(selectedItem, nextSelectable);
    event.preventDefault();
  }
};

const moveShiftTab = (
  event: KeyboardEvent<HTMLElement>,
  {
    selectedItem,
    insidePanel,
    activeItems,
    panelItems,
    focusInButton,
  }: {
    selectedItem: HTMLElement;
    insidePanel: boolean;
    activeItems: HTMLElement[];
    panelItems: HTMLElement[];
    focusInButton: boolean;
  }
) => {
  if (insidePanel) {
    if (selectedItem === activeItems[0]) {
      moveFocus(selectedItem, activeItems[activeItems.length - 1]);
      event.preventDefault();
    } else if (focusInButton) {
      event.preventDefault();
      moveFocus(selectedItem, panelItems.find(nonDisabledElement));
    }
  }
};

type keyDownHandler = (
  event: KeyboardEvent<HTMLElement>,
  options: {
    activeItems: HTMLElement[];
    visibleItems: HTMLElement[];
    selectedItem: HTMLElement;
    insidePanel: boolean;
    panelItems: HTMLElement[];
  }
) => void;

const keyDownHandlers: { [key: string]: keyDownHandler } = {
  ArrowDown(event, { visibleItems, selectedItem, insidePanel, panelItems }) {
    const focusInButton =
      selectedItem === visibleItems[visibleItems.length - 1];
    if (focusInButton && insidePanel) {
      moveFocus(selectedItem, panelItems.find(nonDisabledElement));
      event.preventDefault();
    }
  },
  Tab(
    event,
    { visibleItems, selectedItem, insidePanel, panelItems, activeItems }
  ) {
    const focusInButton =
      selectedItem === visibleItems[visibleItems.length - 1];
    if (event.shiftKey) {
      moveShiftTab(event, {
        selectedItem,
        insidePanel,
        activeItems,
        panelItems,
        focusInButton,
      });
      return;
    } else if (insidePanel) {
      if (selectedItem === activeItems[activeItems.length - 1]) {
        moveFocus(selectedItem, panelItems.find(nonDisabledElement));
        event.preventDefault();
      } else if (focusInButton) {
        moveFocus(selectedItem, panelItems.find(nonDisabledElement));
        event.preventDefault();
      }
    }
  },
  Home(event, { selectedItem, activeItems }) {
    if (event.ctrlKey) {
      handleEdgeMove(event, selectedItem, "first", activeItems);
    }
  },
  End(event, { selectedItem, activeItems }) {
    if (event.ctrlKey) {
      handleEdgeMove(event, selectedItem, "last", activeItems);
    }
  },
  Escape(event, { insidePanel, selectedItem, visibleItems }) {
    const eventTarget = event.target as HTMLElement;
    const expanded = eventTarget.getAttribute("aria-expanded");
    if (insidePanel && expanded !== "true") {
      moveFocus(selectedItem, visibleItems[visibleItems.length - 1]);
      event.preventDefault();
    }
  },
  Enter(event, { insidePanel, selectedItem, visibleItems }) {
    if (insidePanel) {
      moveFocus(selectedItem, visibleItems[visibleItems.length - 1]);
      event.preventDefault();
    }
  },
  " "(event, { insidePanel, selectedItem, visibleItems }) {
    if (insidePanel) {
      moveFocus(selectedItem, visibleItems[visibleItems.length - 1]);
      event.preventDefault();
    }
  },
};

export default function useKeyboardNavigation(
  visibleItems: MutableRefObject<HTMLElement[]>
) {
  function mapKeyToNavigationKey({ key, altKey }: KeyboardEvent<HTMLElement>) {
    let mappedKey = key;
    if (key === "ArrowUp" && altKey) {
      mappedKey = "Home";
    } else if (key === "ArrowDown" && altKey) {
      mappedKey = "End";
    }
    return mappedKey;
  }

  const getPanelItems = (overflowPanel: HTMLElement) =>
    Array.from(overflowPanel.querySelectorAll(".panel-item")).reduce(
      (focusable: HTMLElement[], item) => {
        if (
          item.querySelector('[tabindex = "0"]') ||
          item.querySelector('[tabindex = "-1"], [role = "radio"]') ||
          item.querySelector("input")
        ) {
          const focusableItem =
            item.querySelector('[tabindex = "0"]') ||
            item.querySelector('[tabindex = "-1"], [role = "radio"]') ||
            item.querySelector("input");
          if (focusableItem) {
            focusable.push(focusableItem as HTMLElement);
          }
        }
        return focusable;
      },
      []
    );

  return useCallback(
    function handleKeyboardNavigationKeyDown(
      event: KeyboardEvent<HTMLElement>
    ) {
      const navigationKey = mapKeyToNavigationKey(event);
      const overflowPanel = document.querySelector(
        "#overflowPanelContainer"
      ) as HTMLElement;
      const panelItems = overflowPanel ? getPanelItems(overflowPanel) : [];
      const insidePanel = panelItems.length > 0;
      const activeItems = insidePanel ? panelItems : visibleItems.current;
      const selectedItem = document.activeElement as HTMLElement;
      if (keyDownHandlers[navigationKey]) {
        keyDownHandlers[navigationKey](event, {
          insidePanel,
          activeItems,
          panelItems,
          visibleItems: visibleItems.current,
          selectedItem,
        });
      }
    },
    [visibleItems]
  );
}
