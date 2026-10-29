import { Avatar, type AvatarProps, FlowLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

const categoryColors: AvatarProps["color"][] = [
  "category-1",
  "category-2",
  "category-3",
  "category-4",
  "category-5",
  "category-6",
  "category-7",
  "category-8",
  "category-9",
  "category-10",
  "category-11",
  "category-12",
  "category-13",
  "category-14",
  "category-15",
  "category-16",
  "category-17",
  "category-18",
  "category-19",
  "category-20",
];

// Deterministically maps a name to one of the categorical colors.
// The same name will always resolve to the same color. Empty or missing
// names fall back to "accent" so the result stays stable across renders.
function nameToColor(name?: string): AvatarProps["color"] {
  if (!name || name.trim() === "") return "accent";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

const names = [
  "Alex Brailescu",
  "Peter Piper",
  "Sofia Hernandez",
  "Wei Zhang",
  "Priya Patel",
  "Mateus Oliveira",
];

export const NameToColor = (): ReactElement => {
  return (
    <FlowLayout gap={1}>
      {names.map((name) => (
        <Avatar key={name} name={name} color={nameToColor(name)} />
      ))}
    </FlowLayout>
  );
};
