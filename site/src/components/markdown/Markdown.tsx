import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { code, p, ul } from "../mdx/index";

const components = { code, ul, p };

export default function Markdown(
  props: ComponentPropsWithoutRef<typeof ReactMarkdown>,
) {
  return <ReactMarkdown {...props} components={components} />;
}
