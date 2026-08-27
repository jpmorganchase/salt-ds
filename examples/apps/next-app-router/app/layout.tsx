import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/theme-next.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";
import { AppProvider } from "./providers";

export const metadata: Metadata = {
  title: "Salt Next starter",
  description: "A current Salt Design System App Router starter",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
