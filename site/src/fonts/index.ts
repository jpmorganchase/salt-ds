import { Open_Sans, PT_Mono } from "next/font/google";

export { amplitude } from "./amplitude";

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
