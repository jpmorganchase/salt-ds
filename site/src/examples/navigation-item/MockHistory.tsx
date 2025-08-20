import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";

export function MockHistory({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}
