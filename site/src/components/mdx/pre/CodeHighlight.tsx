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
          {tokens.map((line, i) => {
            const { key, ...rest } = getLineProps({ line, key: i });
            return (
              <div key={key} {...rest} style={{}}>
                {line.map((token, i) => {
                  const { key, ...rest } = getTokenProps({ token, key: i });
                  return <span key={key} {...rest} style={{}} />;
                })}
              </div>
            );
          })}
        </>
      )}
    </Highlight>
  );
}
