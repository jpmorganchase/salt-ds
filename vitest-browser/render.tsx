import { SaltProvider } from "@salt-ds/core";
import type { ReactNode } from "react";
import { render } from "vitest-browser-react";

export function renderWithSalt(children: ReactNode) {
  return render(
    <SaltProvider density="medium" mode="light">
      {children}
    </SaltProvider>,
  );
}
