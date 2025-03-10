import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  isValidElement,
  useRef,
} from "react";
import type { CodeHighlightProps } from "./CodeHighlight";
import styles from "./Pre.module.css";
import "prismjs/themes/prism.css";
import { Button } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import type { Language } from "prism-react-renderer";

interface PreProps
  extends Partial<CodeHighlightProps>,
    ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const CodeHighlight = dynamic(import("./CodeHighlight"), { ssr: false });

export const Pre = forwardRef<HTMLDivElement, PreProps>(function Pre(
  { language: languageProp, code: codeProp = "", children, className },
  ref,
) {
  let code: string | undefined = codeProp.replace(/<br>/g, "\n");
  let language: Language | undefined = languageProp;
  if (isValidElement<{ className?: string; children: string }>(children)) {
    const codeBlock = children.props;
    code = codeBlock.children;
    language = codeBlock.className?.replace("language-", "") as Language;
  }

  const preRef = useRef<HTMLPreElement>(null);
  const handleClickCopy = () => {
    if (preRef.current?.textContent) {
      navigator.clipboard.writeText(preRef.current.textContent).catch(() => {});
    }
  };

  return (
    <div className={clsx(styles.pre, className)} ref={ref}>
      <Button
        aria-label="Copy code"
        sentiment="neutral"
        appearance="transparent"
        className={styles.copyButton}
        onClick={handleClickCopy}
      >
        <CopyIcon aria-hidden />
      </Button>
      <pre className={`language-${language ?? ""}`} ref={preRef}>
        <CodeHighlight code={code} language={language as Language} />
      </pre>
    </div>
  );
});
