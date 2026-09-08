import localFont from "next/font/local";

export { amplitude } from "./amplitude";

export const ptMono = localFont({
  src: "../../../node_modules/@fontsource/pt-mono/files/pt-mono-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--site-font-family-ptMono",
});

export const openSans = localFont({
  src: [
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/open-sans/files/open-sans-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--site-font-family-openSans",
});
