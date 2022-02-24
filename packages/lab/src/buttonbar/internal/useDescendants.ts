// Copied from https://gist.github.com/ryanflorence/10e9387f633f9d2e6f444a9bddaabf6e
import { useState, Dispatch, SetStateAction } from "react";

export function useDescendants<T>(): [T[], Dispatch<SetStateAction<T[]>>] {
  return useState<T[]>([]);
}
