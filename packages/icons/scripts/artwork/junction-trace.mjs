const attribute = "data-salt-junctions";
const number = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][-+]?\\d+)?";
const curveSyntax = new RegExp(
  `^M\\s*(${number})[\\s,]+(${number})\\s*([QA])([\\s\\S]+)$`,
);
const numberToken = new RegExp(number, "g");

// Keep each descriptor local to one actual curve. A broad path or bounding
// window cannot establish that all of a connection's exposed sectors pass.
function validateCurve(curve) {
  if (typeof curve !== "string") return false;
  const match = curveSyntax.exec(curve);
  if (!match) return false;
  const values = match[4].match(numberToken) ?? [];
  if (match[4].replace(numberToken, "").replace(/[\s,]/g, "")) return false;
  if (values.length !== (match[3] === "Q" ? 4 : 7)) return false;
  if (
    ![match[1], match[2], ...values].every((value) => Number.isFinite(+value))
  )
    return false;
  if (match[3] === "A") {
    if (+values[0] <= 0 || +values[1] <= 0) return false;
    if (![values[3], values[4]].every((flag) => flag === "0" || flag === "1"))
      return false;
  }
  return true;
}

const escapeAttribute = (value) =>
  value.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });

/**
 * Add review-only metadata without changing the body's paint or coordinates.
 * Curves are absolute M…Q/A subpaths in this group's local coordinate system.
 * The production exporter strips these neutral groups before optimization.
 */
export function traceJunctions(body, features) {
  if (typeof body !== "string" || !Array.isArray(features))
    throw new TypeError(
      "Junction traces require a string body and feature array",
    );
  const identities = new Set();
  const curves = new Set();
  const descriptors = features.map((feature) => {
    if (!feature || typeof feature !== "object" || Array.isArray(feature))
      throw new TypeError("Invalid junction descriptor");
    const { construction, sector, curve, expected = "weld" } = feature;
    if (
      Object.keys(feature).some(
        (key) => !["construction", "sector", "curve", "expected"].includes(key),
      ) ||
      ![construction, sector].every(
        (value) => typeof value === "string" && value.trim().length > 0,
      ) ||
      !["weld", "softened-opening"].includes(expected) ||
      !validateCurve(curve)
    )
      throw new TypeError(
        "Invalid junction descriptor: expected one M…Q/A curved treatment",
      );
    const identity = JSON.stringify([construction, sector]);
    if (identities.has(identity) || curves.has(curve))
      throw new TypeError("Duplicate junction descriptor");
    identities.add(identity);
    curves.add(curve);
    return { construction, sector, curve, expected };
  });
  return descriptors.length
    ? `<g ${attribute}="${escapeAttribute(JSON.stringify(descriptors))}">${body}</g>`
    : body;
}

// Scan tags rather than deleting closing </g> strings: trace groups can be
// nested among transformed groups, and quoted attributes/comments can contain
// tag-like text. Retaining original slices also retains every byte of paint.
function* tags(source) {
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf("<", cursor);
    if (start === -1) return;
    const special = source.startsWith("<!--", start)
      ? "-->"
      : source.startsWith("<![CDATA[", start)
        ? "]]>"
        : source.startsWith("<?", start)
          ? "?>"
          : null;
    if (special) {
      const end = source.indexOf(special, start + 2);
      if (end === -1)
        throw new SyntaxError("Unclosed SVG comment or declaration");
      cursor = end + special.length;
      continue;
    }
    let quote = null;
    let end = start + 1;
    for (; end < source.length; end++) {
      const character = source[end];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === ">") {
        break;
      }
    }
    if (end === source.length) throw new SyntaxError("Unclosed SVG tag");
    cursor = end + 1;
    yield { start, end: cursor, text: source.slice(start, cursor) };
  }
}

/** Remove only neutral groups emitted by traceJunctions, preserving all paint. */
export function stripJunctionTraces(body) {
  if (typeof body !== "string") throw new TypeError("Expected an SVG string");
  if (!body.includes(attribute)) return body;
  const stack = [];
  const removals = [];
  const ownWrapper = /^<g\s+data-salt-junctions="[^"]*"\s*>$/;
  for (const tag of tags(body)) {
    if (/^<g(?=[\s/>])/.test(tag.text) && !/\/\s*>$/.test(tag.text)) {
      stack.push({ ...tag, remove: ownWrapper.test(tag.text) });
    } else if (/^<\/g\s*>$/.test(tag.text)) {
      const opening = stack.pop();
      if (!opening) throw new SyntaxError("Unbalanced SVG group closing tag");
      if (opening.remove) removals.push(opening, tag);
    }
  }
  if (stack.length) throw new SyntaxError("Unclosed SVG group");
  removals.sort((a, b) => a.start - b.start);
  let clean = "";
  let cursor = 0;
  for (const { start, end } of removals) {
    clean += body.slice(cursor, start);
    cursor = end;
  }
  return clean + body.slice(cursor);
}
