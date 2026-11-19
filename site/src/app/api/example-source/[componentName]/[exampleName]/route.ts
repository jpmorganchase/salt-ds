import {
  type ExampleSourceParams,
  highlightExampleSource,
  listExampleSources,
  readExampleSource,
} from "../../../../../lib/exampleSource";

// Each example's highlighted source is generated once at build time and read
// from disk on every request in development.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return listExampleSources();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<ExampleSourceParams> },
) {
  const source = await readExampleSource(await params);
  if (source === undefined) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(await highlightExampleSource(source), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
