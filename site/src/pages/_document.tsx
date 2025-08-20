import { Head, Html, Main, NextScript } from "next/document";

/*
 * This is the same as the default Next.js _document.js, but with lang="en".
 */
export default function Document() {
  return (
    <Html lang="en" className="salt-theme salt-theme-next salt-editorial">
      <Head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed to set the initial theme based on localStorage and avoid a flash of unstyled content (FOUC).
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = JSON.parse(localStorage.getItem("mosaic-theme-pref")).state.colorMode || "light";
                 document.documentElement.setAttribute("data-mode", theme);
              } catch (e) {
                //
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
