import { createContext } from "@jpmorganchase/uitk-core";

export interface ButtonBarContextValue {
  matches: boolean;
  alignedIndex?: number;
  align?: "left" | "right";
}

export const ButtonBarContext = createContext<ButtonBarContextValue>(
  "ButtonBarContext",
  {
    matches: false,
  }
);
