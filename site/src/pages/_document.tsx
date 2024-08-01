import { Head, Html, Main, NextScript } from "next/document";

const description =
  "Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries.";

/*
 * This is the same as the default Next.js _document.js, but with lang="en".
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name={"description"} content={description} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
