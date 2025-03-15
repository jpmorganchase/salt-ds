import dynamic from "next/dynamic";
import type { ComponentPropsWithoutRef } from "react";
import { code, p, ul } from "../mdx/index";

const components = { code, ul, p };

// @ts-ignore
const ReactMarkdown = dynamic(() => import("react-markdown"));

export default function Markdown(
  props: ComponentPropsWithoutRef<typeof ReactMarkdown>,
) {
  return <ReactMarkdown {...props} components={components} />;
}
