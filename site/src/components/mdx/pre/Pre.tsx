import { Button, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  isValidElement,
  type ReactNode,
  useRef,
  useState,
} from "react";
import styles from "./Pre.module.css";

interface PreProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  code?: string;
  language?: string;
}

export const Pre = forwardRef<HTMLDivElement, PreProps>(function Pre(
  { language: languageProp, code: codeProp = "", children, className },
  ref,
) {
  let code: string | undefined = codeProp.replace(/<br>/g, "\n");
  let language: string | undefined = languageProp;
  if (isValidElement<{ className?: string; children: string }>(children)) {
    const codeBlock = children.props;
    code = codeBlock.children;
    language = codeBlock.className?.replace("language-", "");
  }

  const divRef = useRef<HTMLDivElement>(null);
  const handleClickCopy = () => {
    if (divRef.current?.textContent) {
      navigator.clipboard
        .writeText(divRef.current.textContent)
        .catch(console.error);
    }
  };

  const trimmedCode = code.replace(/\n+$/, "");

  const [html, setHtml] = useState<string>("");

  useIsomorphicLayoutEffect(() => {
    async function format() {
      const { codeToHtml } = await import("shiki");

      if (language) {
        const html = await codeToHtml(trimmedCode, {
          lang: language,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
        });
        setHtml(html);
      }
    }

    format();
  }, [trimmedCode, language]);

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
      <div
        className={styles.codeblock}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for Shiki.
        dangerouslySetInnerHTML={{ __html: html }}
        ref={divRef}
      />
    </div>
  );
});
