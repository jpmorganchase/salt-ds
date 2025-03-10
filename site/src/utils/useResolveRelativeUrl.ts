import { useStore } from "@jpmorganchase/mosaic-store";

const hasProtocol = (href: string) => href && /^(\w*:|\/\/)/.test(href);

function resolveRelativeUrl(href: string, baseRoute: string) {
  if (hasProtocol(href) || href.startsWith("#") || !href.startsWith(".")) {
    return href;
  }
  if (!baseRoute) {
    throw new Error("Cannot resolve relative url as base route is undefined");
  }
  const url = new URL("http://jpmorgan.com");
  const anchorMatches = href.match(/(.*)#(.*)/);
  if (anchorMatches?.[2]) {
    // Anchors will get encoded to %23 if set on URL
    url.pathname = `${baseRoute}/../${anchorMatches[1]}`;
    return `${url.pathname}#${anchorMatches[2]}`;
  }
  url.pathname = `${baseRoute}/../${href}`;
  return url.pathname;
}

export function useResolveRelativeUrl(url: string) {
  const route = useStore((state) => state.route);
  return resolveRelativeUrl(url, route ?? "/");
}
