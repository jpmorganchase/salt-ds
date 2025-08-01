import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";

export function MockHistory({ children }: { children: ReactNode }) {
  // @ts-ignore
  return <MemoryRouter>{children}</MemoryRouter>;
}
