const sources = new Map<string, Promise<string>>();

/** Shares one request per example for the session, but lets a failed request be retried. */
export function fetchExampleSource(componentName: string, exampleName: string) {
  const url = `/api/example-source/${encodeURIComponent(componentName)}/${encodeURIComponent(exampleName)}`;
  let source = sources.get(url);
  if (!source) {
    source = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.text();
    });
    sources.set(url, source);
    source.catch(() => sources.delete(url));
  }
  return source;
}
