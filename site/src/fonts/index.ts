import { Open_Sans, PT_Mono } from "next/font/google";
import localFont from "next/font/local";

export const ptMono = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  // Below are not set to salt variable directly so that local serve will resolve correct CSS specificity
  variable: "--site-font-family-ptMono",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--site-font-family-openSans",
});

export const amplitude = localFont({
  src: [
    {
      path: "./amplitude-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./amplitude-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./amplitude-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./amplitude-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--site-font-family-amplitude",
});
