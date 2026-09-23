// Discovery is intentionally independent of construction helpers and review
// decisions. These are candidates, never a list of defects or approved welds.
// Keep this function self-contained: the audit serializes it into a browser.
export function discoverJunctionCandidates(svg) {
  const version = "junction-discovery/1";
  const namespace = "http://www.w3.org/2000/svg";
  const warnings = [];
  const round = (n) => Number(n.toFixed(5));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const mix = (a, b, t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const angle = (v) => ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360;
  const turn = (a, b) =>
    (Math.atan2(cross(a, b), a.x * b.x + a.y * b.y) * 180) / Math.PI;
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (
    parsed.querySelector("parsererror") ||
    parsed.documentElement.localName !== "svg"
  ) {
    throw new Error("Junction discovery requires a valid SVG document.");
  }
  const root = document.importNode(parsed.documentElement, true);
  const unsupported = [
    ...root.querySelectorAll(
      "use,text,image,foreignObject,mask,clipPath,filter,style",
    ),
  ];
  for (const element of unsupported)
    warnings.push(`Unsupported paint or containment: ${element.localName}.`);
  root
    .querySelectorAll("script,foreignObject,image,style")
    .forEach((element) => element.remove());
  for (const element of [root, ...root.querySelectorAll("*")]) {
    for (const attribute of [...element.attributes]) {
      if (/^on/i.test(attribute.name) || /href$/i.test(attribute.name))
        element.removeAttribute(attribute.name);
    }
  }
  const box = root.viewBox.baseVal;
  const unit =
    box.width > 0 && box.height > 0 ? Math.max(box.width, box.height) / 16 : 1;
  const sampleStep = 0.08 * unit;
  const nearMargin = 0.12 * unit;
  const sharpTurnDegrees = 20;
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none;contain:strict;width:1024px;height:1024px";
  host.append(root);
  document.body.append(host);
  const geometry = [];
  const candidates = [];
  let sampledEdges = 0;
  let shapeCount = 0;
  let rawContactBins = 0;
  let contactRegions = 0;

  // Expand every SVG command, including relative movetos and smooth controls.
  // Splitting contours avoids treating a moveto jump as an actual member.
  const parsePath = (d) => {
    const tokens =
      d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
    const counts = {
      M: 2,
      L: 2,
      H: 1,
      V: 1,
      C: 6,
      S: 4,
      Q: 4,
      T: 2,
      A: 7,
      Z: 0,
    };
    const contours = [];
    let current = { x: 0, y: 0 },
      start = current,
      command,
      previous = "",
      control;
    let contour;
    for (let index = 0; index < tokens.length; ) {
      if (/^[a-zA-Z]$/.test(tokens[index])) command = tokens[index++];
      if (!command || counts[command.toUpperCase()] === undefined)
        throw new Error("Unsupported SVG path command.");
      const upper = command.toUpperCase(),
        relative = command !== upper;
      const count = counts[upper];
      const values = tokens.slice(index, index + count).map(Number);
      if (values.length !== count || values.some((n) => !Number.isFinite(n)))
        throw new Error("Invalid SVG path parameters.");
      index += count;
      const point = (x, y) => ({
        x: x + (relative ? current.x : 0),
        y: y + (relative ? current.y : 0),
      });
      if (upper === "M") {
        current = point(values[0], values[1]);
        start = current;
        contour = { segments: [], closed: false };
        contours.push(contour);
        command = relative ? "l" : "L";
        previous = "M";
        control = undefined;
        continue;
      }
      if (!contour) throw new Error("SVG path must start with a moveto.");
      let end, text, nextControl;
      const coordinates = (p) => `${p.x} ${p.y}`;
      if (upper === "L" || upper === "H" || upper === "V" || upper === "Z") {
        end =
          upper === "Z"
            ? start
            : upper === "H"
              ? point(values[0], relative ? 0 : current.y)
              : upper === "V"
                ? point(relative ? 0 : current.x, values[0])
                : point(values[0], values[1]);
        text = `L${coordinates(end)}`;
        if (upper === "Z") {
          contour.closed = true;
          command = undefined;
        }
      } else if (upper === "C" || upper === "S") {
        const reflected =
          (previous === "C" || previous === "S") && control
            ? { x: 2 * current.x - control.x, y: 2 * current.y - control.y }
            : current;
        const first = upper === "C" ? point(values[0], values[1]) : reflected;
        const second =
          upper === "C"
            ? point(values[2], values[3])
            : point(values[0], values[1]);
        end =
          upper === "C"
            ? point(values[4], values[5])
            : point(values[2], values[3]);
        text = `C${coordinates(first)} ${coordinates(second)} ${coordinates(end)}`;
        nextControl = second;
      } else if (upper === "Q" || upper === "T") {
        const reflected =
          (previous === "Q" || previous === "T") && control
            ? { x: 2 * current.x - control.x, y: 2 * current.y - control.y }
            : current;
        const first = upper === "Q" ? point(values[0], values[1]) : reflected;
        end =
          upper === "Q"
            ? point(values[2], values[3])
            : point(values[0], values[1]);
        text = `Q${coordinates(first)} ${coordinates(end)}`;
        nextControl = first;
      } else {
        end = point(values[5], values[6]);
        text = `A${values.slice(0, 5).join(" ")} ${coordinates(end)}`;
      }
      contour.segments.push({
        start: current,
        end,
        d: `M${coordinates(current)}${text}`,
        curved: ["A", "C", "S", "Q", "T"].includes(upper),
      });
      current = end;
      previous = upper;
      control = nextControl;
    }
    return contours;
  };

  const shapePath = (element) => {
    const value = (name, fallback = 0) =>
      Number(element.getAttribute(name) ?? fallback);
    const tag = element.localName;
    if (tag === "path") return element.getAttribute("d") || "";
    if (tag === "line")
      return `M${value("x1")} ${value("y1")}L${value("x2")} ${value("y2")}`;
    if (tag === "polyline" || tag === "polygon")
      return `M${element.getAttribute("points") || ""}${tag === "polygon" ? "Z" : ""}`;
    if (tag === "circle" || tag === "ellipse") {
      const cx = value("cx"),
        cy = value("cy"),
        rx = value(tag === "circle" ? "r" : "rx"),
        ry = value(tag === "circle" ? "r" : "ry");
      return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }
    const x = value("x"),
      y = value("y"),
      w = value("width"),
      h = value("height");
    const rx = Math.min(w / 2, value("rx", value("ry"))),
      ry = Math.min(h / 2, value("ry", value("rx")));
    if (!rx || !ry) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
  };
  const add = (kind, point, contours, details, rays = []) => {
    candidates.push({
      kind,
      x: round(point.x),
      y: round(point.y),
      contours: [...new Set(contours)].sort(),
      classification: "unreviewed",
      details,
      rays,
    });
  };
  try {
    const inverseRoot = root.getCTM().inverse();
    const shapes = [
      ...root.querySelectorAll(
        "path,line,polyline,polygon,rect,circle,ellipse",
      ),
    ].filter((element) => !element.closest("defs,clipPath,mask,symbol"));
    const signatures = new Map();
    for (const element of shapes) {
      const style = getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      )
        continue;
      const fill =
        element.localName !== "line" &&
        style.fill !== "none" &&
        Number(style.fillOpacity) !== 0;
      const stroke =
        style.stroke !== "none" &&
        Number(style.strokeOpacity) !== 0 &&
        parseFloat(style.strokeWidth) > 0;
      if (!fill && !stroke) continue;
      const shapeId = `shape-${++shapeCount}`;
      const matrix = inverseRoot.multiply(element.getCTM());
      const scale = Math.max(
        Math.hypot(matrix.a, matrix.b),
        Math.hypot(matrix.c, matrix.d),
      );
      const transform = (p) => new DOMPoint(p.x, p.y).matrixTransform(matrix);
      const strokeWidth = stroke ? parseFloat(style.strokeWidth) * scale : 0;
      // Numeric masters have a 0.67 primary stroke; 1.5 is the reviewed heavy
      // component width. This is a candidate search envelope, not a paint test.
      const searchWidth = (strokeWidth * 1.5) / 0.67;
      if (style.vectorEffect === "non-scaling-stroke")
        warnings.push(
          `${shapeId}: non-scaling stroke uses a conservative transformed width.`,
        );
      const contours = parsePath(shapePath(element));
      for (
        let contourIndex = 0;
        contourIndex < contours.length;
        contourIndex++
      ) {
        const contour = contours[contourIndex];
        const id = `${shapeId}/contour-${contourIndex + 1}`;
        const segments = [];
        const points = [];
        let length = 0;
        for (const segment of contour.segments) {
          const path = document.createElementNS(namespace, "path");
          path.setAttribute("d", segment.d);
          const localLength = path.getTotalLength();
          if (!(localLength > 1e-7)) continue;
          // A straight segment is already an exact analytic edge. Subdividing
          // it adds duplicate contact comparisons without improving coverage.
          const count = segment.curved
            ? Math.max(1, Math.ceil((localLength * scale) / sampleStep))
            : 1;
          const part = [];
          for (let index = 0; index <= count; index++) {
            const point = transform(
              path.getPointAtLength((localLength * index) / count),
            );
            part.push(point);
            if (points.length)
              length += distance(points[points.length - 1], point);
            points.push({ x: point.x, y: point.y, at: length });
          }
          const epsilon = Math.min(
            localLength / 50,
            (0.002 * unit) / (scale || 1),
          );
          segments.push({
            ...segment,
            start: part[0],
            end: part[part.length - 1],
            points: part,
            incoming: subtract(
              part[part.length - 1],
              transform(path.getPointAtLength(localLength - epsilon)),
            ),
            outgoing: subtract(
              transform(path.getPointAtLength(epsilon)),
              part[0],
            ),
          });
        }
        if (!segments.length) continue;
        // Filled open subpaths close implicitly. Include that boundary so an
        // unstated Z cannot hide two corners or a contact from discovery.
        const implicitClose =
          fill &&
          !contour.closed &&
          distance(points[0], points[points.length - 1]) > 1e-5;
        if (implicitClose) {
          const start = points[points.length - 1],
            end = points[0],
            vector = subtract(end, start);
          const count = 1;
          const part = [];
          for (let i = 0; i <= count; i++) {
            const point = mix(start, end, i / count);
            part.push(point);
            length += distance(points[points.length - 1], point);
            points.push({ ...point, at: length });
          }
          segments.push({
            start,
            end,
            points: part,
            curved: false,
            incoming: vector,
            outgoing: vector,
            implicit: true,
          });
        }
        const closed = contour.closed || fill;
        const signature = `${closed}|${points.map((p) => `${round(p.x)},${round(p.y)}`).join(";")}`;
        const previous = signatures.get(signature);
        if (previous) {
          previous.sources.push(id);
          previous.fill ||= fill;
          previous.strokeWidth = Math.max(previous.strokeWidth, strokeWidth);
          previous.searchWidth = Math.max(previous.searchWidth, searchWidth);
          if (fill) {
            previous.fillElement = element;
            previous.fillMatrix = matrix;
          }
          continue;
        }
        const record = {
          id,
          sources: [id],
          points,
          segments,
          closed,
          fill,
          strokeWidth,
          searchWidth,
          length,
          fillElement: fill ? element : undefined,
          fillMatrix: fill ? matrix : undefined,
        };
        signatures.set(signature, record);
        geometry.push(record);
      }
    }
    for (const contour of geometry) {
      const { segments } = contour;
      for (let index = 0; index < segments.length; index++) {
        if (index === 0 && !contour.closed) continue;
        const previous =
          segments[(index + segments.length - 1) % segments.length];
        const next = segments[index];
        const degrees = turn(previous.incoming, next.outgoing);
        if (Math.abs(degrees) < sharpTurnDegrees) continue;
        let boundary = contour.fill ? "ambiguous-filled-corner" : "stroke-bend";
        if (contour.fillElement?.isPointInFill) {
          const middle = mix(next.start, next.points[1] || next.end, 0.5);
          const vector = next.outgoing,
            norm = Math.hypot(vector.x, vector.y);
          const delta = 0.015 * unit;
          const inverse = contour.fillMatrix.inverse();
          const left = new DOMPoint(
            middle.x - (vector.y / norm) * delta,
            middle.y + (vector.x / norm) * delta,
          ).matrixTransform(inverse);
          const right = new DOMPoint(
            middle.x + (vector.y / norm) * delta,
            middle.y - (vector.x / norm) * delta,
          ).matrixTransform(inverse);
          const leftFilled = contour.fillElement.isPointInFill(left),
            rightFilled = contour.fillElement.isPointInFill(right);
          if (leftFilled !== rightFilled)
            boundary =
              degrees * (leftFilled ? 1 : -1) < 0
                ? "filled-concavity"
                : "filled-convexity";
        }
        add(
          "contour-corner",
          next.start,
          contour.sources,
          {
            turnDegrees: round(degrees),
            boundary,
            strokeWidth: round(contour.strokeWidth),
            implicitClosure: Boolean(previous.implicit || next.implicit),
            interpretation:
              "Abrupt contour direction change; feature role and exposed paint require review.",
          },
          [
            angle({ x: -previous.incoming.x, y: -previous.incoming.y }),
            angle(next.outgoing),
          ],
        );
      }
      for (const segment of segments) {
        if (!segment.curved || !contour.strokeWidth) continue;
        let minimumRadius = Infinity,
          location;
        for (let i = 1; i < segment.points.length - 1; i++) {
          const a = segment.points[i - 1],
            b = segment.points[i],
            c = segment.points[i + 1];
          const area = Math.abs(cross(subtract(b, a), subtract(c, a)));
          if (area < 1e-8) continue;
          const radius =
            (distance(a, b) * distance(b, c) * distance(c, a)) / (2 * area);
          if (radius < minimumRadius) {
            minimumRadius = radius;
            location = b;
          }
        }
        if (minimumRadius < contour.searchWidth * 0.75)
          add("tight-curve", location, contour.sources, {
            approximateCenterlineRadius: round(minimumRadius),
            heavyStrokeSearchWidth: round(contour.searchWidth),
            interpretation:
              "A sampled curve may be substantially covered by heavy stroke; inspect its inside painted edge.",
          });
      }
    }

    const edges = [];
    const cells = new Map();
    const cellSize = unit;
    const closest = (a, b, c, d) => {
      const ab = subtract(b, a),
        cd = subtract(d, c),
        ac = subtract(c, a);
      const denominator = cross(ab, cd);
      if (Math.abs(denominator) > 1e-12) {
        const t = cross(ac, cd) / denominator,
          u = cross(ac, ab) / denominator;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
          return { a: mix(a, b, t), b: mix(c, d, u), t, u, distance: 0 };
      }
      const projection = (p, x, y) => {
        const vector = subtract(y, x);
        const t = Math.max(
          0,
          Math.min(
            1,
            ((p.x - x.x) * vector.x + (p.y - x.y) * vector.y) /
              (vector.x ** 2 + vector.y ** 2),
          ),
        );
        return { p: mix(x, y, t), t };
      };
      const alternatives = [
        (() => {
          const p = projection(a, c, d);
          return { a, b: p.p, t: 0, u: p.t };
        })(),
        (() => {
          const p = projection(b, c, d);
          return { a: b, b: p.p, t: 1, u: p.t };
        })(),
        (() => {
          const p = projection(c, a, b);
          return { a: p.p, b: c, t: p.t, u: 0 };
        })(),
        (() => {
          const p = projection(d, a, b);
          return { a: p.p, b: d, t: p.t, u: 1 };
        })(),
      ];
      return alternatives
        .map((item) => ({ ...item, distance: distance(item.a, item.b) }))
        .sort((x, y) => x.distance - y.distance)[0];
    };
    const contacts = new Map();
    for (let contourIndex = 0; contourIndex < geometry.length; contourIndex++) {
      const contour = geometry[contourIndex];
      for (let i = 1; i < contour.points.length; i++) {
        const a = contour.points[i - 1],
          b = contour.points[i];
        if (distance(a, b) < 1e-8) continue;
        const margin = contour.searchWidth / 2 + nearMargin;
        const edge = {
          a,
          b,
          contour,
          contourIndex,
          index: edges.length,
          step: i,
        };
        const x0 = Math.floor((Math.min(a.x, b.x) - margin) / cellSize),
          x1 = Math.floor((Math.max(a.x, b.x) + margin) / cellSize);
        const y0 = Math.floor((Math.min(a.y, b.y) - margin) / cellSize),
          y1 = Math.floor((Math.max(a.y, b.y) + margin) / cellSize);
        const nearby = new Set();
        for (let x = x0; x <= x1; x++)
          for (let y = y0; y <= y1; y++)
            for (const other of cells.get(`${x},${y}`) || []) nearby.add(other);
        for (const otherIndex of nearby) {
          const other = edges[otherIndex];
          const limit =
            (contour.searchWidth + other.contour.searchWidth) / 2 + nearMargin;
          if (contourIndex === other.contourIndex) {
            const along = Math.abs((a.at + b.at - other.a.at - other.b.at) / 2);
            if (
              Math.min(
                along,
                contour.closed ? contour.length - along : Infinity,
              ) < Math.max(limit * 2.5, sampleStep * 4)
            )
              continue;
          }
          const match = closest(a, b, other.a, other.b);
          if (match.distance > limit) continue;
          const separation =
            match.distance -
            (contour.searchWidth + other.contour.searchWidth) / 2;
          const directionDifference = Math.abs(
            turn(subtract(b, a), subtract(other.b, other.a)),
          );
          const crossing =
            match.distance < 1e-5 &&
            directionDifference > 15 &&
            directionDifference < 165;
          const kind = crossing
            ? "centerline-crossing"
            : match.distance < 1e-5
              ? "coincident-boundary"
              : separation <= 0
                ? "paint-envelope-contact"
                : "near-contact";
          // Preserve separate exact intersections. Envelope contacts are grouped
          // into local regions; their extent remains explicit in the evidence.
          const point = mix(match.a, match.b, 0.5);
          const quantum = (crossing ? 0.0001 : 0.35) * unit;
          const key = `${other.contourIndex}/${contourIndex}/${kind}/${Math.round(point.x / quantum)},${Math.round(point.y / quantum)}`;
          let contact = contacts.get(key);
          if (!contact) {
            contact = {
              kind,
              point,
              sources: [...other.contour.sources, ...contour.sources],
              minimumDistance: match.distance,
              minimumSeparation: separation,
              count: 0,
              rays: [],
              bounds: [point.x, point.y, point.x, point.y],
            };
            contacts.set(key, contact);
          }
          contact.count++;
          contact.minimumDistance = Math.min(
            contact.minimumDistance,
            match.distance,
          );
          contact.minimumSeparation = Math.min(
            contact.minimumSeparation,
            separation,
          );
          contact.bounds = [
            Math.min(contact.bounds[0], point.x),
            Math.min(contact.bounds[1], point.y),
            Math.max(contact.bounds[2], point.x),
            Math.max(contact.bounds[3], point.y),
          ];
          for (const [member, fraction] of [
            [edge, match.t],
            [other, match.u],
          ]) {
            const at = member.a.at + (member.b.at - member.a.at) * fraction;
            if (member.contour.closed || at > sampleStep / 4)
              contact.rays.push(angle(subtract(member.a, member.b)));
            if (
              member.contour.closed ||
              at < member.contour.length - sampleStep / 4
            )
              contact.rays.push(angle(subtract(member.b, member.a)));
          }
        }
        edges.push(edge);
        for (let x = x0; x <= x1; x++)
          for (let y = y0; y <= y1; y++) {
            const key = `${x},${y}`;
            if (!cells.has(key)) cells.set(key, []);
            cells.get(key).push(edge.index);
          }
      }
    }
    sampledEdges = edges.length;
    rawContactBins = contacts.size;
    // A sampled curved edge can contribute dozens of nearby contact bins.
    // Keep its connected relationship as one region, without truncating raw
    // comparisons or merging distinct exact crossings. Corners stay separate.
    const exact = [...contacts.values()].filter(
      (item) => item.kind === "centerline-crossing",
    );
    const pairs = new Map();
    for (const contact of contacts.values()) {
      if (contact.kind === "centerline-crossing") continue;
      const key = contact.sources.join();
      if (!pairs.has(key)) pairs.set(key, []);
      pairs.get(key).push(contact);
    }
    const regions = [...exact];
    for (const group of pairs.values()) {
      const parents = group.map((_, index) => index);
      const find = (index) => {
        while (parents[index] !== index) {
          parents[index] = parents[parents[index]];
          index = parents[index];
        }
        return index;
      };
      for (let i = 0; i < group.length; i++) {
        for (let j = 0; j < i; j++) {
          const a = group[i].bounds,
            b = group[j].bounds;
          const dx = Math.max(0, a[0] - b[2], b[0] - a[2]);
          const dy = Math.max(0, a[1] - b[3], b[1] - a[3]);
          if (Math.hypot(dx, dy) <= sampleStep * 2.1)
            parents[find(i)] = find(j);
        }
      }
      const connected = new Map();
      group.forEach((contact, index) => {
        const key = find(index);
        let region = connected.get(key);
        if (!region) {
          region = {
            ...contact,
            bounds: [...contact.bounds],
            bins: 0,
            kinds: new Set(),
            count: 0,
          };
          connected.set(key, region);
        }
        region.bins++;
        region.kinds.add(contact.kind);
        region.count += contact.count;
        if (contact.minimumDistance < region.minimumDistance) {
          region.point = contact.point;
          region.rays = contact.rays;
        }
        region.minimumDistance = Math.min(
          region.minimumDistance,
          contact.minimumDistance,
        );
        region.minimumSeparation = Math.min(
          region.minimumSeparation,
          contact.minimumSeparation,
        );
        region.bounds = [
          Math.min(region.bounds[0], contact.bounds[0]),
          Math.min(region.bounds[1], contact.bounds[1]),
          Math.max(region.bounds[2], contact.bounds[2]),
          Math.max(region.bounds[3], contact.bounds[3]),
        ];
      });
      for (const region of connected.values()) {
        region.kind =
          region.kinds.size > 1 ? "contact-region" : [...region.kinds][0];
        regions.push(region);
      }
    }
    contactRegions = regions.length;
    for (const contact of regions) {
      if (
        contact.kind !== "centerline-crossing" &&
        exact.some(
          (item) =>
            item.sources.join() === contact.sources.join() &&
            distance(item.point, contact.point) < 0.8 * unit,
        )
      )
        continue;
      add(
        contact.kind,
        contact.point,
        contact.sources,
        {
          sampledComparisons: contact.count,
          connectedContactBins: contact.bins || 1,
          relationshipKinds: contact.kinds
            ? [...contact.kinds].sort()
            : [contact.kind],
          centerlineDistance: round(contact.minimumDistance),
          heavyPaintEnvelopeSeparation: round(contact.minimumSeparation),
          region: contact.bounds.map(round),
          interpretation:
            "Possible geometric relationship; occlusion, separate objects, and semantic intent are unclassified.",
        },
        contact.rays,
      );
    }
  } finally {
    host.remove();
  }
  // Generator patches and retained rims can meet at exactly the same point.
  // One junction at that coordinate retains every contributing contour and
  // direction, rather than requiring the author to classify each paint layer.
  const coincident = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.kind}/${Math.round(candidate.x / (0.0001 * unit))}/${Math.round(candidate.y / (0.0001 * unit))}`;
    const existing = coincident.get(key);
    if (!existing) {
      candidate.details.coincidentObservationCount = 1;
      coincident.set(key, candidate);
      continue;
    }
    existing.contours = [
      ...new Set([...existing.contours, ...candidate.contours]),
    ].sort();
    existing.rays.push(...candidate.rays);
    existing.details.coincidentObservationCount++;
    if (candidate.details.boundary)
      existing.details.boundaries = [
        ...new Set([
          ...(existing.details.boundaries || [existing.details.boundary]),
          candidate.details.boundary,
        ]),
      ].sort();
    if (candidate.details.region) {
      const a = existing.details.region,
        b = candidate.details.region;
      existing.details.region = [
        Math.min(a[0], b[0]),
        Math.min(a[1], b[1]),
        Math.max(a[2], b[2]),
        Math.max(a[3], b[3]),
      ];
      existing.details.sampledComparisons +=
        candidate.details.sampledComparisons;
      existing.details.connectedContactBins +=
        candidate.details.connectedContactBins;
      existing.details.centerlineDistance = Math.min(
        existing.details.centerlineDistance,
        candidate.details.centerlineDistance,
      );
      existing.details.heavyPaintEnvelopeSeparation = Math.min(
        existing.details.heavyPaintEnvelopeSeparation,
        candidate.details.heavyPaintEnvelopeSeparation,
      );
    }
  }
  candidates.length = 0;
  candidates.push(...coincident.values());
  const roundedRays = (angles) => {
    const result = [];
    for (const value of angles.sort((a, b) => a - b)) {
      if (
        !result.some(
          (other) =>
            Math.min(Math.abs(value - other), 360 - Math.abs(value - other)) <
            12,
        )
      )
        result.push(round(value));
    }
    return result;
  };
  for (const candidate of candidates) {
    candidate.directions = roundedRays(candidate.rays);
    candidate.sectors =
      candidate.directions.length > 1
        ? candidate.directions.map((from, index, directions) => ({
            id: `sector-${index + 1}`,
            fromDegrees: from,
            toDegrees: directions[(index + 1) % directions.length],
            sweepDegrees: round(
              (directions[(index + 1) % directions.length] - from + 360) % 360,
            ),
            classification: "unreviewed",
          }))
        : [];
    delete candidate.rays;
  }
  candidates.sort(
    (a, b) =>
      a.y - b.y ||
      a.x - b.x ||
      a.kind.localeCompare(b.kind) ||
      a.contours.join().localeCompare(b.contours.join()),
  );
  candidates.forEach((candidate, index) => {
    candidate.id = `junction-${String(index + 1).padStart(4, "0")}`;
  });
  return {
    version,
    candidates,
    scope: {
      shapeCount,
      contourCount: geometry.length,
      sampledEdges,
      rawContactBins,
      contactRegions,
      sampleStep: round(sampleStep),
      nearMargin: round(nearMargin),
      sharpTurnDegrees,
      searchStroke:
        "Numeric-master width multiplied by 1.5 / 0.67; an approximate heavy-paint envelope.",
      completeness:
        "Candidate discovery only. No candidate or sector is classified or approved automatically.",
      limitations: [
        "Finite 0.08-unit sampling can miss relationships or curvature below that scale; exact command-boundary corners are also inspected.",
        "Paint envelopes do not evaluate clipping, masks, occlusion, cap/join extensions, or which member is in front.",
        "Geometry cannot determine whether a join is structural, a separate overlap, notation, an intended planar corner, or a justified small-size exception.",
        "Transform scaling uses the larger axis scale for a conservative stroke envelope; nonuniform/skewed strokes require visual review.",
        "Connected sampled contacts on the same contour pair are grouped into explicit regions; directions describe their representative location, not every point of the region. Exact crossings and contour corners remain separate.",
        "IDs are deterministic for identical input and detector version, but can change after geometry edits; review validity must be tied to the complete artwork hash.",
      ],
    },
    warnings: [...new Set(warnings)],
  };
}
