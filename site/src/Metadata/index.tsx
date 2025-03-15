import { useMeta } from "@jpmorganchase/mosaic-store";
import Head from "next/head";

export const Metadata = () => {
  const { meta } = useMeta();
  return (
    <Head>
      {meta.title && <title>{meta.title}</title>}
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {Array.isArray(meta.breadcrumbs) && meta.breadcrumbs.length > 0 && (
        <meta content={JSON.stringify(meta.breadcrumbs)} name="breadcrumbs" />
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
};
