import { optimize } from "svgo";

// Compare landmarks in the complete fitted exports. These checks intentionally
// retain the final canvas placement; reverting the optical fit would hide the
// state changes that they guard against.
export async function checkScalingActions(page, records) {
  const names = [
    "flag.svg",
    "flag_solid.svg",
    "copy.svg",
    "copy_solid.svg",
    "chat-group.svg",
    "chat-group_solid.svg",
    "message-forward.svg",
    "message-reply.svg",
    "message-reply-all.svg",
    "filter.svg",
    "filter_solid.svg",
    "filter-clear.svg",
    "filter-clear_solid.svg",
  ];
  const samples = names.map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record) throw new Error(`Missing action scaling artwork: ${name}`);
    return {
      name,
      svg: optimize(record.svg, {
        plugins: [
          {
            name: "convertPathData",
            params: {
              forceAbsolutePath: true,
              floatPrecision: 12,
              lineShorthands: false,
              collapseRepeated: false,
            },
          },
        ],
      }).data,
    };
  });
  return page.evaluate(async (samples) => {
    const results = [];
    const failures = [];
    const hosts = [];
    const geometry = new Map();
    const roots = new Map();
    const report = (result, passed) => {
      results.push(result);
      if (!passed) failures.push(result);
    };
    const xy = (p) => [p.x, p.y];
    const pointDelta = (a, b) =>
      Math.max(
        ...a.flatMap((point, i) => point.map((v, j) => Math.abs(v - b[i][j]))),
      );
    try {
      for (const { name, svg } of samples) {
        const host = document.createElement("div");
        host.style.cssText = "position:absolute;left:-10000px;top:0";
        host.innerHTML = svg;
        document.body.appendChild(host);
        hosts.push(host);
        const root = host.querySelector("svg");
        roots.set(name, root);
        const parts = [];
        for (const source of [...root.querySelectorAll("path")]) {
          for (const d of source.getAttribute("d").match(/M[^M]*/g) ?? []) {
            const path = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
            path.setAttribute("d", d);
            // Geometry-only nodes never participate in the painted specimens.
            path.setAttribute("visibility", "hidden");
            root.appendChild(path);
            const box = path.getBBox();
            const length = path.getTotalLength();
            parts.push({
              path,
              closed: /z/i.test(d),
              curved: /[ACQST]/i.test(d),
              bounds: [box.x, box.y, box.width, box.height],
              length,
              points: Array.from({ length: 25 }, (_, i) =>
                xy(path.getPointAtLength((length * i) / 24)),
              ),
            });
          }
        }
        geometry.set(name, parts);
      }
      for (const [name, companion, feature, select] of [
        [
          "flag_solid.svg",
          "flag.svg",
          "retained flag pole",
          (parts) => parts.find((p) => p.bounds[2] < 0.01 && p.bounds[3] > 10),
        ],
        [
          "copy_solid.svg",
          "copy.svg",
          "retained rear document",
          (parts) => parts.find((p) => !p.closed),
        ],
        [
          "chat-group_solid.svg",
          "chat-group.svg",
          "retained rear bubble",
          (parts) => parts.find((p) => !p.closed),
        ],
      ]) {
        const a = select(geometry.get(name));
        const b = select(geometry.get(companion));
        const maxDelta =
          a && b ? pointDelta(a.points, b.points) : Number.POSITIVE_INFINITY;
        report(
          {
            name,
            companion,
            check: "stable-retained-feature",
            feature,
            maxDelta,
            bounds: a?.bounds,
            companionBounds: b?.bounds,
          },
          maxDelta < 0.015,
        );
      }
      const reply = geometry.get("message-reply.svg");
      const replyAll = geometry.get("message-reply-all.svg");
      const stemSamples = [0, 1, 2, 4, 6, 8, 10, 12, 14];
      const stem = (part) =>
        stemSamples.map((distance) => xy(part.path.getPointAtLength(distance)));
      const bendDelta = pointDelta(stem(replyAll[0]), stem(reply[0]));
      report(
        {
          name: "message-reply-all.svg",
          companion: "message-reply.svg",
          check: "stable-reply-stem-and-bend",
          distances: stemSamples,
          maxDelta: bendDelta,
          points: stem(replyAll[0]),
          companionPoints: stem(reply[0]),
        },
        bendDelta < 0.015,
      );
      // Keep the two original straight chevron gestures distinct from their
      // new curved root patches. Select by final geometry, not path position.
      const chevrons = (parts) => parts.filter((part) =>
        !part.closed && !part.curved && part.bounds[2] > 1 &&
        Math.abs(part.bounds[3] - 2 * part.bounds[2]) < .03,
      ).sort((a, b) => b.bounds[0] - a.bounds[0]);
      const heads = chevrons(replyAll);
      const replyHead = chevrons(reply)[0];
      // A smooth bend can still crowd the rear chevron. Measure the final
      // straight shaft against its horizontal arm span, without prescribing
      // the recipe's radius or reversing the exported fit.
      const rearHeadSpan = heads[0].bounds[2];
      const shaft = replyAll[0];
      const tip = xy(shaft.path.getPointAtLength(shaft.length));
      let straightRun = 0;
      for (let d = 0; d <= shaft.length; d += 0.005) {
        const point = xy(shaft.path.getPointAtLength(shaft.length - d));
        if (Math.abs(point[1] - tip[1]) > 0.0025) break;
        straightRun = Math.abs(point[0] - tip[0]);
      }
      report(
        {
          name: "message-reply-all.svg",
          check: "clear-horizontal-run-before-reply-bend",
          straightRun,
          rearHeadSpan,
        },
        straightRun >= rearHeadSpan * 0.98,
      );
      const headDelta = pointDelta(heads.at(-1).points, replyHead.points);
      const sameGesture = heads.every((part) => {
        const delta = part.points.map((point) =>
          point.map((v, j) => v - part.points[12][j]),
        );
        const peer = replyHead.points.map((point) =>
          point.map((v, j) => v - replyHead.points[12][j]),
        );
        return pointDelta(delta, peer) < 0.015;
      });
      report(
        {
          name: "message-reply-all.svg",
          companion: "message-reply.svg",
          check: "same-chevron-gesture-and-leading-anchor",
          headCount: heads.length,
          maxDelta: headDelta,
        },
        heads.length === 2 && sameGesture && headDelta < 0.015,
      );
      const forward = stem(geometry.get("message-forward.svg")[0]).map(
        ([x, y]) => [16 - x, y],
      );
      const mirrorDelta = pointDelta(forward, stem(reply[0]));
      report(
        {
          name: "message-forward.svg",
          companion: "message-reply.svg",
          check: "mirrored-message-bend",
          maxDelta: mirrorDelta,
        },
        mirrorDelta < 0.015,
      );
      const funnel = geometry.get("filter-clear.svg")[0];
      for (const name of [
        "filter.svg",
        "filter_solid.svg",
        "filter-clear_solid.svg",
      ]) {
        const part = geometry.get(name)[0];
        const maxDelta = pointDelta(part.points, funnel.points);
        report(
          {
            name,
            companion: "filter-clear.svg",
            check: "stable-filter-funnel",
            maxDelta,
            bounds: part.bounds,
            companionBounds: funnel.bounds,
          },
          maxDelta < 0.015,
        );
      }
      // The funnel may contain both fill and rim paths. Locate the two open
      // diagonal clear strokes by their geometry rather than a path offset.
      const clearMark = (parts) =>
        parts
          .filter(
            (part) =>
              !part.closed &&
              part.bounds[2] > 0.5 &&
              Math.abs(part.bounds[2] - part.bounds[3]) < 0.015,
          )
          .sort((a, b) => a.points[0][0] - b.points[0][0]);
      const clear = clearMark(geometry.get("filter-clear.svg"));
      const clearSolid = clearMark(geometry.get("filter-clear_solid.svg"));
      const clearDelta =
        clear.length === 2 && clearSolid.length === 2
          ? Math.max(
              ...clear.map((part, i) =>
                pointDelta(part.points, clearSolid[i].points),
              ),
            )
          : Number.POSITIVE_INFINITY;
      report(
        {
          name: "filter-clear_solid.svg",
          companion: "filter-clear.svg",
          check: "stable-clear-mark",
          maxDelta: clearDelta,
        },
        clear.length === 2 && clearDelta < 0.015,
      );

      const ppu = 128;
      const side = 16 * ppu;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const alphaAt = (pixels, x, y) => {
        const px = Math.round(x * ppu - 0.5);
        const py = Math.round(y * ppu - 0.5);
        return pixels[(py * side + px) * 4 + 3] / 255;
      };
      for (const name of ["filter-clear.svg", "filter-clear_solid.svg"]) {
        const root = roots.get(name);
        const widths = [root, ...root.querySelectorAll("[stroke-width]")]
          .filter((element) => element.hasAttribute("stroke-width"))
          .map((element) => [
            element,
            Number(element.getAttribute("stroke-width")),
          ]);
        for (const weight of [0.67, 1, 4 / 3, 1.5]) {
          for (const [element, width] of widths)
            element.setAttribute(
              "stroke-width",
              String((width * weight) / 0.67),
            );
          root.style.color = "black";
          const image = new Image();
          image.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(root))}`;
          await image.decode();
          ctx.clearRect(0, 0, side, side);
          ctx.drawImage(image, 0, 0, side, side);
          const pixels = ctx.getImageData(0, 0, side, side).data;
          // This horizontal slice passes just inside the square cap corner
          // nearest the funnel stem, not merely through the terminal centre.
          const y = 8.754052 + (weight * Math.SQRT1_2) / 2 - 0.02;
          const origin = [8.795594, y];
          const transitions = [];
          let previous = alphaAt(pixels, ...origin) >= 0.5;
          for (let i = 1; i <= 5 * ppu; i++) {
            const x = origin[0] + i / ppu;
            const painted = alphaAt(pixels, x, y) >= 0.5;
            if (painted !== previous)
              transitions.push({
                kind: painted ? "entry" : "exit",
                point: [x - 0.5 / ppu, y],
              });
            previous = painted;
          }
          const gap =
            transitions[0]?.kind === "exit" && transitions[1]?.kind === "entry"
              ? transitions[1].point[0] - transitions[0].point[0]
              : null;
          const expected =
            2.471065 - (weight * Math.SQRT1_2) / 2 + 0.02 - weight / 2;
          report(
            {
              name,
              weight,
              check: "clear-cap-corner-stays-separated",
              origin,
              direction: [1, 0],
              transitions,
              gap,
              expected,
            },
            gap !== null && Math.abs(gap - expected) < 0.035 && gap > 1.15,
          );
        }
      }
      return { results, failures };
    } finally {
      for (const host of hosts) host.remove();
    }
  }, samples);
}
