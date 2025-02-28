import type Tree from "./Tree";

import { sortByDOMLocation } from "./utils";

function treeReducer(state: Tree.State, action: Tree.Action): Tree.State {
  switch (action.type) {
    case "register": {
      const {
        idToElement,
        idToParentId,
        idToChildrenIds,
        charToNodeIds,
        leafIds,
      } = state;

      const { id, element, label, parentId, isLeaf } = action.payload;

      idToElement.set(id, element);
      idToParentId.set(id, parentId);

      if (!idToChildrenIds.has(parentId)) {
        idToChildrenIds.set(parentId, new Set());
      }

      idToChildrenIds.get(parentId)?.add(id);

      if (isLeaf) {
        leafIds.add(id);
      }

      const char = label.charAt(0).toUpperCase();

      if (!charToNodeIds.has(char)) {
        charToNodeIds.set(char, new Set());
      }

      charToNodeIds.get(char)?.add(id);

      return {
        ...state,
        idToElement: new Map(
          [...idToElement.entries()].sort(sortByDOMLocation),
        ),
        idToParentId: new Map(idToParentId),
        idToChildrenIds: new Map(idToChildrenIds),
        leafIds: new Set(leafIds),
      };
    }
    case "unregister": {
      const { id, label } = action.payload;
      const {
        idToElement,
        idToParentId,
        idToChildrenIds,
        charToNodeIds,
        expandedIds,
        selectedIds,
        leafIds,
        activeId,
      } = state;

      expandedIds.delete(id);
      selectedIds.delete(id);
      leafIds.delete(id);

      const childrenIds = idToChildrenIds.get(id);
      if (childrenIds) {
        for (const childId of childrenIds) {
          idToParentId.delete(childId);
          idToElement.delete(childId);
          idToChildrenIds.delete(childId);
        }
      }

      const parentId = idToParentId.get(id);

      if (parentId) {
        idToChildrenIds.get(parentId)?.delete(id);
      }

      const char = label.charAt(0).toUpperCase();
      charToNodeIds.get(char)?.delete(id);

      idToElement.delete(id);

      return {
        ...state,
        activeId: activeId === id ? "" : activeId,
        expandedIds: new Set(expandedIds),
        selectedIds: new Set(selectedIds),
        idToElement: new Map(idToElement),
        idToParentId: new Map(idToParentId),
        leafIds: new Set(leafIds),
      };
    }
    case "focus/next": {
      const { idToElement, activeId } = state;

      const nextIdIndex =
        [...idToElement.keys()].findIndex((id) => id === activeId) + 1;

      if (nextIdIndex >= idToElement.size) {
        return state;
      }

      const nextId = [...idToElement.keys()][nextIdIndex];

      return {
        ...state,
        activeId: nextId,
      };
    }
    case "focus/previous": {
      const { idToElement, activeId } = state;
      const previousIdIndex =
        [...idToElement.keys()].findIndex((id) => id === activeId) - 1;

      if (previousIdIndex < 0) {
        return state;
      }

      const previousId = [...idToElement.keys()][previousIdIndex];

      return {
        ...state,
        activeId: previousId,
      };
    }
    case "focus/parent": {
      const parentId = state.idToParentId.get(state.activeId);

      if (!parentId) {
        return state;
      }

      return {
        ...state,
        activeId: parentId,
      };
    }
    case "focus/first": {
      const firstId = [...state.idToElement.keys()].at(0);

      if (!firstId) {
        return state;
      }

      return {
        ...state,
        activeId: firstId,
      };
    }
    case "focus/last": {
      const lastId = [...state.idToElement.keys()].at(-1);

      if (!lastId) {
        return state;
      }

      return {
        ...state,
        activeId: lastId,
      };
    }
    case "focus/id": {
      const id = action.payload;
      const { activeId } = state;

      if (id === activeId) {
        return state;
      }

      return {
        ...state,
        selectedIds: new Set(),
        activeId: id,
      };
    }
    case "focus/char": {
      const letter = action.payload;
      const { idToElement, charToNodeIds, activeId } = state;

      const ids = [...(charToNodeIds.get(letter) || new Set())].filter((id) =>
        idToElement.has(id),
      );

      if (!ids) {
        return state;
      }

      const currentIndex = [...ids].findIndex((id) => id === activeId);

      if (currentIndex === -1) {
        return {
          ...state,
          activeId: [...ids][0],
        };
      }

      const nextIndex = (currentIndex + 1) % ids.length;

      return {
        ...state,
        activeId: [...ids][nextIndex],
      };
    }
    case "expand/id": {
      const id = action.payload;
      const { expandedIds, leafIds } = state;

      if (leafIds.has(id)) {
        return state;
      }

      return {
        ...state,
        expandedIds: new Set(expandedIds.add(id)),
      };
    }
    case "expand/active": {
      const { activeId, expandedIds, leafIds } = state;

      if (expandedIds.has(activeId)) {
        return state;
      }

      if (leafIds.has(activeId)) {
        return state;
      }

      return {
        ...state,
        expandedIds: new Set(expandedIds.add(activeId)),
      };
    }
    case "expand/level": {
      const parentId = state.idToParentId.get(state.activeId);

      if (parentId === undefined) {
        return state;
      }

      const siblingIds = state.idToChildrenIds.get(parentId);

      if (siblingIds === undefined) {
        return state;
      }

      return {
        ...state,
        expandedIds: new Set([...state.expandedIds, ...siblingIds]),
      };
    }
    case "collapse/active": {
      const { activeId, expandedIds } = state;

      if (expandedIds.has(activeId)) {
        expandedIds.delete(activeId);

        return {
          ...state,
          expandedIds: new Set([...expandedIds]),
        };
      }

      return state;
    }
    case "toggle/id": {
      const id = action.payload;
      const { expandedIds, leafIds } = state;

      if (leafIds.has(id)) {
        return state;
      }

      if (expandedIds.has(id)) {
        expandedIds.delete(id);
      } else {
        expandedIds.add(id);
      }

      return {
        ...state,
        expandedIds: new Set(expandedIds),
      };
    }
    case "toggle/active": {
      const id = state.activeId;
      const { expandedIds } = state;

      if (expandedIds.has(id)) {
        expandedIds.delete(id);
      } else {
        expandedIds.add(id);
      }

      return {
        ...state,
        expandedIds: new Set([...expandedIds]),
      };
    }
    case "select/active": {
      const { activeId, selectedIds } = state;

      if (!selectedIds.has(activeId)) {
        selectedIds.add(activeId);
      } else {
        selectedIds.delete(activeId);
      }

      return {
        ...state,
        selectedIds: new Set(selectedIds),
      };
    }
    case "select/level": {
      const { idToParentId, idToChildrenIds, activeId } = state;
      const parentId = idToParentId.get(activeId) ?? null;
      const siblingIds = idToChildrenIds.get(parentId) ?? new Set([activeId]);

      return {
        ...state,
        selectedIds: new Set([...siblingIds]),
      };
    }
    case "select/range": {
      const [startId, endId] = action.payload;
      const { idToElement } = state;

      const ids = [...idToElement.keys()];

      const [startIndex, endIndex] = [
        ids.indexOf(startId),
        ids.indexOf(endId),
      ].sort();

      return {
        ...state,
        selectedIds: new Set([...ids.slice(startIndex, endIndex + 1)]),
      };
    }
    case "select/reset": {
      return {
        ...state,
        selectedIds: new Set(),
      };
    }
    case "select/id": {
      return state;
    }
    case "deselect/active": {
      const { activeId, selectedIds } = state;

      selectedIds.delete(activeId);

      return {
        ...state,
        selectedIds: new Set(selectedIds),
      };
    }
    case "deselect/all": {
      return state;
    }
    case "deselect/id": {
      const { selectedIds } = state;
      const id = action.payload;

      selectedIds.delete(id);

      return {
        ...state,
        selectedIds: new Set(selectedIds),
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${exhaustiveCheck}`);
    }
  }
}

export default treeReducer;
