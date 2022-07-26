import React from "react";

function union<T>(set1: Set<T>, ...sets: Set<T>[]) {
  const result = new Set(set1);
  for (let set of sets) {
    for (let element of set) {
      result.add(element);
    }
  }
  return result;
}

export const ArrowUp = "ArrowUp";
export const ArrowDown = "ArrowDown";
export const ArrowLeft = "ArrowLeft";
export const ArrowRight = "ArrowRight";
export const Enter = "Enter";
export const Escape = "Escape";
export const Home = "Home";
export const End = "End";
export const PageUp = "PageUp";
export const PageDown = "PageDown";
export const Space = " ";

const actionKeys = new Set(["Enter", "Delete", " "]);
const focusKeys = new Set(["Tab"]);
// const navigationKeys = new Set(["Home", "End", "ArrowRight", "ArrowLeft","ArrowDown", "ArrowUp"]);
const arrowLeftRightKeys = new Set(["ArrowRight", "ArrowLeft"]);
const navigationKeys = new Set([
  Home,
  End,
  PageUp,
  PageDown,
  ArrowDown,
  ArrowUp,
]);
const functionKeys = new Set([
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
]);
const specialKeys = union(
  actionKeys,
  navigationKeys,
  arrowLeftRightKeys,
  functionKeys,
  focusKeys
);
export const isCharacterKey = (evt: React.KeyboardEvent) => {
  if (specialKeys.has(evt.key)) {
    return false;
  }
  return evt.key.length === 1 && !evt.ctrlKey && !evt.metaKey && !evt.altKey;
};

export const isNavigationKey = ({ key }: React.KeyboardEvent) => {
  return navigationKeys.has(key);
};
