import type { Metadata } from "next";
import type { ReactNode } from "react";
import { amplitude, openSans, ptMono, roboto } from "../fonts";
import { LiveReload } from "./LiveReload";
import { Providers } from "./providers";

import "@salt-ds/theme/css/baseline.css";
import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/css/experimental/salt-interim.css";
import "@salt-ds/theme/index.css";
import "../css/index.css";

const themeClassName = [
  "salt-editorial",
  ptMono.variable,
  openSans.variable,
  amplitude.variable,
  roboto.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.saltdesignsystem.com",
  ),
};

const themePreference = `
  (() => {
    const root = document.documentElement;
    try {
      const mode = JSON.parse(localStorage.getItem("mosaic-theme-pref"))?.state?.colorMode;
      root.setAttribute("data-mode", mode === "dark" ? "dark" : "light");
    } catch (error) { /* Storage can be unavailable. Keep the default light mode. */ }
    // Match Salt's md breakpoint before any body content can paint. React still
    // hydrates with the server's low-density state, then synchronizes in layout.
    const mobile = !window.matchMedia("(min-width: 960px)").matches;
    root.classList.toggle("salt-density-low", !mobile);
    root.classList.toggle("salt-density-mobile", mobile);
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`salt-theme salt-theme-next salt-density-low ${themeClassName}`}
      data-mode="light"
      data-accent="teal"
      data-corner="rounded"
      data-heading-font="Amplitude"
      data-action-font="Amplitude"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Apply colour mode and responsive density before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themePreference }} />
      </head>
      <body>
        <Providers themeClassName={themeClassName}>{children}</Providers>
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
