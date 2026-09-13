// Check retained landmarks on the shipped 16-unit geometry. These probes use
// common family anchors, not reversed fits or SVG path-string snapshots.
export async function checkScalingMedia(page, records) {
  const musicFrame = [1.034884, -0.020349, -0.303416];
  const microphoneFrame = [1.076923, -0.615385, -0.615385];
  const cases = [
    ...[
      "music.svg",
      "music_solid.svg",
      "music-disabled.svg",
      "music-disabled_solid.svg",
    ].map((name) => ({
      name,
      frame: musicFrame,
      feature: "retained left note across Music states",
      points: [
        [3, 17.25],
        [6, 19.5],
        [6.75, 14.25],
      ],
    })),
    ...[
      "microphone.svg",
      "microphone_solid.svg",
      "microphone-disabled.svg",
      "microphone-disabled_solid.svg",
    ].map((name) => ({
      name,
      frame: microphoneFrame,
      feature: "retained microphone support and foot",
      strokeOnly: true,
      points: [
        [5.25, 10.5],
        [18.75, 10.5],
        [12, 18.75],
        [8.25, 21.75],
        [15.75, 21.75],
      ],
    })),
    ...["laptop.svg", "laptop_solid.svg"].map((name) => ({
      name,
      frame: [1.103448, -0.827586, -0.827586],
      feature: "retained laptop base",
      strokeOnly: true,
      points: [
        [2.5, 16.5],
        [21.5, 16.5],
        [3.5, 19],
        [20.5, 19],
      ],
    })),
    ...["guide-closed.svg", "guide-closed_solid.svg"].map((name) => ({
      name,
      frame: [1.272727, -2.556818, -2.181818],
      feature: "retained guide binding pins",
      strokeOnly: true,
      points: [7.5, 12, 16.5].flatMap((y) => [
        [3.75, y],
        [6.75, y],
      ]),
    })),
    ...["build-report.svg", "build-report_solid.svg"].map((name) => ({
      name,
      frame: [1.166667, -1.333333, -1.625],
      feature: "retained report handle",
      strokeOnly: true,
      points: [
        [8.25, 7.5],
        [8.25, 3.75],
        [15.75, 3.75],
        [15.75, 7.5],
      ],
    })),
    ...["folder-open.svg", "folder-open_solid.svg"].map((name) => ({
      name,
      frame: [1.184783, -1.774457, -1.774457],
      feature: "retained rear folder and tab",
      strokeOnly: true,
      points: [
        [3.75, 20.25],
        [3.75, 4.5],
        [9.75, 4.5],
        [12.75, 7.5],
        [18.75, 7.5],
        [18.75, 10.5],
      ],
    })),
  ];
  const needed = new Set([
    ...cases.map((test) => test.name),
    "stop_solid.svg",
    "play_solid.svg",
    "pause_solid.svg",
  ]);
  const artwork = [...needed].map((name) => {
    const record = records.find((r) => r.name === name);
    if (!record) throw new Error(`Missing media scaling artwork: ${name}`);
    return { name, svg: record.svg };
  });
  return page.evaluate(
    async ({ cases, artwork }) => {
      const results = [];
      const failures = [];
      const host = document.createElement("div");
      host.style.cssText = "position:absolute;left:-10000px;top:0;color:black";
      document.body.appendChild(host);
      try {
        for (const test of cases) {
          host.innerHTML = artwork.find((r) => r.name === test.name).svg;
          const paths = [...host.querySelectorAll("path")].filter((path) => {
            const style = getComputedStyle(path);
            return !test.strokeOnly || style.stroke !== "none";
          });
          if (!paths.length)
            throw new Error(`No retained geometry: ${test.name}`);
          // Sample final path geometry at no more than .00625-unit intervals.
          // The .025-unit envelope includes sampling/SVGO error, under .019px
          // at native12. The former shifts were .375 to2.874 units.
          const samples = paths.flatMap((path) => {
            const length = path.getTotalLength();
            const count = Math.max(1, Math.ceil(length / 0.00625));
            return Array.from({ length: count + 1 }, (_, i) => {
              const point = path.getPointAtLength((length * i) / count);
              return [point.x, point.y];
            });
          });
          const landmarks = test.points.map((point) => {
            const expected = [
              ((point[0] * 2) / 3) * test.frame[0] + test.frame[1],
              ((point[1] * 2) / 3) * test.frame[0] + test.frame[2],
            ];
            let distance = Number.POSITIVE_INFINITY;
            let nearest = null;
            for (const sample of samples) {
              const measured = Math.hypot(
                sample[0] - expected[0],
                sample[1] - expected[1],
              );
              if (measured < distance) {
                distance = measured;
                nearest = sample;
              }
            }
            return { expected, nearest, distance };
          });
          const maxDistance = Math.max(
            ...landmarks.map((point) => point.distance),
          );
          const result = {
            name: test.name,
            feature: test.feature,
            coordinateSpace: "final-16-unit-canvas",
            landmarks,
            maxDistance,
            tolerance: 0.025,
            pass: maxDistance <= 0.025,
          };
          results.push(result);
          if (!result.pass) failures.push(result);
        }
        // Optical playback balance is checked from complete final paint. It
        // permits the reviewed range, without requiring unlike shapes to have
        // equal ink area. View-box validation separately checks the exact fit.
        const pixelsPerUnit = 64;
        const side = 16 * pixelsPerUnit;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = side;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const paints = {};
        for (const name of [
          "stop_solid.svg",
          "play_solid.svg",
          "pause_solid.svg",
        ]) {
          const xml = new DOMParser().parseFromString(
            artwork.find((r) => r.name === name).svg,
            "image/svg+xml",
          );
          const svg = xml.documentElement;
          svg.setAttribute("width", side);
          svg.setAttribute("height", side);
          svg.setAttribute("style", "color:black");
          for (const element of [
            svg,
            ...svg.querySelectorAll("[stroke-width]"),
          ])
            if (element.hasAttribute("stroke-width"))
              element.setAttribute(
                "stroke-width",
                Number(element.getAttribute("stroke-width")) / 0.67,
              );
          const url = URL.createObjectURL(
            new Blob([new XMLSerializer().serializeToString(xml)], {
              type: "image/svg+xml",
            }),
          );
          try {
            const image = new Image();
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
              image.src = url;
            });
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            const pixels = context.getImageData(0, 0, side, side).data;
            let area = 0;
            let minX = side;
            let minY = side;
            let maxX = 0;
            let maxY = 0;
            for (let i = 0; i < side * side; i++) {
              const alpha = pixels[i * 4 + 3] / 255;
              area += alpha;
              if (alpha < 0.5) continue;
              const x = i % side;
              const y = Math.floor(i / side);
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x + 1);
              maxY = Math.max(maxY, y + 1);
            }
            paints[name] = {
              area: area / (pixelsPerUnit * pixelsPerUnit),
              bounds: [minX, minY, maxX, maxY].map((v) => v / pixelsPerUnit),
            };
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        const stop = paints["stop_solid.svg"];
        const width = stop.bounds[2] - stop.bounds[0];
        const height = stop.bounds[3] - stop.bounds[1];
        const toPlay = stop.area / paints["play_solid.svg"].area;
        const toPause = stop.area / paints["pause_solid.svg"].area;
        const result = {
          name: "stop_solid.svg",
          feature: "optical mass beside playback peers",
          coordinateSpace: "final-16-unit-canvas",
          weight: 1,
          pixelsPerUnit,
          paints,
          toPlay,
          toPause,
          pass:
            Math.abs(width - height) <= 0.03 &&
            toPlay >= 1.8 &&
            toPlay <= 2.2 &&
            toPause >= 1.03 &&
            toPause <= 1.25,
        };
        results.push(result);
        if (!result.pass) failures.push(result);
        return { results, failures };
      } finally {
        host.remove();
      }
    },
    { cases, artwork },
  );
}
