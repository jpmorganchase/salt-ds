import Highlight, {
  defaultProps as defaultPrismProps,
} from "prism-react-renderer";
import type { ComponentPropsWithoutRef } from "react";

export interface CodeHighlightProps
  extends Pick<
    ComponentPropsWithoutRef<typeof Highlight>,
    "code" | "language"
  > {}

export default function CodeHighlight({ code, language }: CodeHighlightProps) {
  const trimmedCode = code.replace(/\n+$/, "");
  return (
    <Highlight {...defaultPrismProps} code={trimmedCode} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i} {...getLineProps({ line, key: i })} style={{}}>
              {line.map((token, key) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <span key={key} {...getTokenProps({ token, key })} style={{}} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );
}
