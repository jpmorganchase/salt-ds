import { optimize } from "svgo";

const commandSizes = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
const pathToken =
  /[MmZzLlHhVvCcSsQqTtAa]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g;

// Shared marks are closed filled contours in the final 16-unit viewBox.
// An absolute first move also makes concatenation into an inverse path safe.
function validateMarkPath(path) {
  if (
    typeof path !== "string" ||
    !/^M/.test(path.trim()) ||
    path.replace(pathToken, "").replace(/[\s,]/g, "") !== ""
  )
    throw new Error(
      "Shared mark must be a closed SVG path beginning with absolute M",
    );
  const tokens = path.match(pathToken) ?? [];
  let index = 0;
  let open = false;
  let drawn = false;
  while (index < tokens.length) {
    const command = tokens[index++].toUpperCase();
    if (command === "Z") {
      if (!open) throw new Error("Shared mark closes a missing contour");
      open = false;
      continue;
    }
    const count = commandSizes[command];
    if (!count || (command !== "M" && !open) || (command === "M" && open))
      throw new Error("Shared mark contains an invalid or unclosed contour");
    const values = [];
    while (index < tokens.length && !/^[a-z]$/i.test(tokens[index]))
      values.push(Number(tokens[index++]));
    if (
      values.length === 0 ||
      values.length % count !== 0 ||
      values.some((value) => !Number.isFinite(value))
    )
      throw new Error("Shared mark contains invalid path arguments");
    if (command === "A")
      for (let start = 0; start < values.length; start += count)
        if (
          values[start] < 0 ||
          values[start + 1] < 0 ||
          ![0, 1].includes(values[start + 3]) ||
          ![0, 1].includes(values[start + 4])
        )
          throw new Error("Shared mark contains an invalid arc");
    open = true;
    drawn ||= command !== "M" || values.length > 2;
  }
  if (open || !drawn)
    throw new Error("Shared mark must contain closed drawing contours");
  return path.trim();
}

const filledMark = (path) =>
  `<path d="${path}" fill="currentColor" fill-rule="evenodd" stroke="none"/>`;

export function withSharedMark(body, path, inverse = false) {
  if (typeof body !== "string" || !body.trim())
    throw new Error("Shared mark requires a container body");
  if (typeof inverse !== "boolean")
    throw new Error("Shared mark inverse flag must be boolean");
  return {
    body,
    mark: {
      path: validateMarkPath(path),
      mode: inverse ? "inverse" : "positive",
    },
  };
}

export function standaloneMark(path) {
  const canonical = validateMarkPath(path);
  return {
    // The normal generator divides construction coordinates by 1.5.
    body: `<g transform="scale(1.5)">${filledMark(canonical)}</g>`,
    mark: { path: canonical, mode: "only" },
  };
}

// Compose after fitting the container. A descriptor never participates in its
// bounds calculation, and its final contour is identical in both polarities.
export function composeSharedMark(svg, mark) {
  if (mark === undefined) return svg;
  if (!mark || !["positive", "inverse", "only"].includes(mark.mode))
    throw new Error("Invalid shared mark descriptor");
  const path = validateMarkPath(mark.path);
  return optimize(svg, {
    plugins: [
      {
        name: "composeSharedMark",
        fn(root) {
          const roots = root.children.filter(
            (node) => node.type === "element" && node.name === "svg",
          );
          if (roots.length !== 1 || roots[0].attributes.viewBox !== "0 0 16 16")
            throw new Error("Shared marks require one fitted 16-unit SVG");
          const target = roots[0];
          const containers = [];
          const inspect = (node, inherited = {}) => {
            if (node.type !== "element") return;
            if (node.attributes.transform)
              throw new Error(
                "Shared marks must be composed after transforms are baked",
              );
            const paint = {
              fill: node.attributes.fill ?? inherited.fill ?? "black",
              stroke: node.attributes.stroke ?? inherited.stroke ?? "none",
              rule: node.attributes["fill-rule"] ?? inherited.rule ?? "nonzero",
            };
            if (
              node.name === "path" &&
              paint.fill !== "none" &&
              paint.rule === "evenodd"
            )
              containers.push({ node, stroke: paint.stroke });
            for (const child of node.children) inspect(child, paint);
          };
          inspect(target);
          if (mark.mode === "inverse") {
            if (containers.length !== 1 || containers[0].stroke !== "none")
              throw new Error(
                "Inverse shared mark requires exactly one unstroked even-odd container path",
              );
            const container = containers[0].node;
            if (!container.attributes.d)
              throw new Error("Inverse shared mark container has no path");
            container.attributes.d = `${container.attributes.d} ${path}`;
          } else {
            const element = {
              type: "element",
              name: "path",
              attributes: {
                d: path,
                fill: "currentColor",
                "fill-rule": "evenodd",
                stroke: "none",
              },
              children: [],
            };
            if (mark.mode === "only") target.children = [element];
            else target.children.push(element);
          }
        },
      },
    ],
    js2svg: { pretty: true, indent: 2 },
  }).data;
}
