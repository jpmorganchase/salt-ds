// Copied from https://gist.github.com/ryanflorence/10e9387f633f9d2e6f444a9bddaabf6e
import { type Dispatch, type SetStateAction, useState } from "react";

export function useDescendants<T>(): [T[], Dispatch<SetStateAction<T[]>>] {
  return useState<T[]>([]);
}
